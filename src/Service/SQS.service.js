/* @flow */
import alai from 'alai';
import each from 'async/each';
import AWS from 'aws-sdk';
import { v4 as UUID } from 'uuid';

import { DEFINITIONS } from '../Config/Dependencies';
import DependencyAwareClass from '../DependencyInjection/DependencyAware.class';
import DependencyInjection from '../DependencyInjection/DependencyInjection.class';
import SQSMessageModel from '../Model/SQS/Message.model';
import StatusModel, { STATUS_TYPES } from '../Model/Status.model';

/**
 * Allowed values for `process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE`.
 */
export const SQS_OFFLINE_MODES = {
  /**
   * When running offline, messages will trigger the consumer function directly
   * via a Lambda endpoint, set using `process.env.SERVICE_LAMBDA_URL`. This is
   * the default.
   */
  DIRECT: 'direct',

  /**
   * When running offline, send messages to an offline SQS service defined by
   * `process.env.LAMBDA_WRAPPER_OFFLINE_SQS_HOST`.
   */
  LOCAL: 'local',

  /**
   * When running offline, send messages to AWS as normal.
   */
  AWS: 'aws',
};

/**
 * Defines the preferred behaviour
 * for SQSService.prototype.publish
 * should AWS SQS fail.
 */
export const SQS_PUBLISH_FAILURE_MODES = {
  /**
   * Catches the exception and logs it.
   * This is the default behaviour
   * for LambdaWrapper 1.8.0 and below
   * and for LambdaWrapper 1.8.2 and above
   */
  CATCH: 'catch',

  /**
   * Throws the exception so that the caller
   * can handle it directly.
   */
  THROW: 'throw',
};

/**
 * SQSService class
 */
export default class SQSService extends DependencyAwareClass {
  /**
   * SQSService constructor
   *
   * @param di DependencyInjection
   */
  constructor(di: DependencyInjection) {
    super(di);

    const {
      LAMBDA_WRAPPER_OFFLINE_SQS_HOST: offlineHost = 'localhost',
      LAMBDA_WRAPPER_OFFLINE_SQS_PORT: offlinePort = '4576',
      LAMBDA_WRAPPER_OFFLINE_SQS_MODE: offlineMode = SQS_OFFLINE_MODES.DIRECT,
      AWS_ACCOUNT_ID,
      REGION,
    } = process.env;

    const container = this.getContainer();
    const context = container.getContext();
    const queues = container.getConfiguration('QUEUES');
    const accountId = (context && context.invokedFunctionArn && alai.parse(context)) || AWS_ACCOUNT_ID;

    this.queues = {};

    this.$lambda = null;
    this.$sqs = null;

    if (container.isOffline && !Object.values(SQS_OFFLINE_MODES).includes(offlineMode)) {
      throw new Error(`Invalid LAMBDA_WRAPPER_OFFLINE_SQS_MODE: ${offlineMode}\n`
        + `Please use one of: ${Object.values(SQS_OFFLINE_MODES).join(', ')}`);
    }

    // Add the queues from configuration
    if (queues !== null && Object.keys(queues).length > 0) {
      Object.keys(queues).forEach((queueDefinition) => {
        if (container.isOffline && offlineMode === SQS_OFFLINE_MODES.LOCAL) {
          // custom URL when using an offline SQS service such as Localstack
          this.queues[queueDefinition] = `http://${offlineHost}:${offlinePort}/queue/${queues[queueDefinition]}`;
        } else {
          // default AWS queue URL
          this.queues[queueDefinition] = `https://sqs.${REGION}.amazonaws.com/${accountId}/${queues[queueDefinition]}`;
        }
      });
    }
  }

  /**
   * Returns an SQS client instance
   */
  get sqs() {
    if (!this.$sqs) {
      this.$sqs = new AWS.SQS({
        region: process.env.REGION,
        httpOptions: {
          // longest publish on NOTV took 5 seconds
          connectTimeout: 8 * 1000,
          timeout: 8 * 1000,
        },
        maxRetries: 3, // default is 3, we can change that
      });
    }

    return this.$sqs;
  }

  /**
   * Returns a Lambda client instance
   */
  get lambda() {
    if (!this.$lambda) {
      const endpoint = process.env.SERVICE_LAMBDA_URL;

      if (!endpoint) {
        throw new Error('process.env.SERVICE_LAMBDA_URL must be defined.');
      }

      // move to subprocess
      this.$lambda = new AWS.Lambda({
        region: process.env.AWS_REGION,
        endpoint,
      });
    }

    return this.$lambda;
  }

  /**
   * Returns the mode to use for offline SQS.
   *
   * This is configured by `process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE`. The
   * default is `SQS_OFFLINE_MODES.LAMBDA`.
   */
  static get offlineMode() {
    return process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE || SQS_OFFLINE_MODES.DIRECT;
  }

  /**
   * Batch delete messages
   *
   * @param queue strung
   * @param messageModels [SQSMessageModel]
   * @returns {Promise<any>}
   */
  batchDelete(queue: string, messageModels: [SQSMessageModel]) {
    const container = this.getContainer();
    const queueUrl = this.queues[queue];
    const Logger = container.get(DEFINITIONS.LOGGER);
    const Timer = container.get(DEFINITIONS.TIMER);
    const timerId = `sqs-batch-delete-${UUID()} - Queue: '${queueUrl}'`;

    return new Promise((resolve) => {
      const messagesForDeletion = [];

      Timer.start(timerId);
      // assuming openFiles is an array of file names
      each(
        messageModels,
        (messageModel, callback) => {
          if (messageModel instanceof SQSMessageModel && messageModel.isForDeletion() === true) {
            messagesForDeletion.push({
              Id: messageModel.getMessageId(),
              ReceiptHandle: messageModel.getReceiptHandle(),
            });
          }
          callback();
        },
        (loopError) => {
          if (loopError) {
            Logger.error(loopError);
            resolve();
          }

          this.sqs.deleteMessageBatch(
            {
              Entries: messagesForDeletion,
              QueueUrl: queueUrl,
            },
            (error) => {
              Timer.stop(timerId);

              if (error) {
                Logger.error(error);
              }

              resolve();
            },
          );
        },
      );
    });
  }

  /**
   * Check SQS status
   *
   * @returns {Promise<any>}
   */
  checkStatus() {
    const container = this.getContainer();
    const Logger = container.get(DEFINITIONS.LOGGER);
    const Timer = container.get(DEFINITIONS.TIMER);
    const timerId = `sqs-list-queues-${UUID()}`;

    return new Promise((resolve) => {
      Timer.start(timerId);

      this.sqs.listQueues({}, (error, data) => {
        Timer.stop(timerId);

        const statusModel = new StatusModel('SQS', STATUS_TYPES.OK);

        if (error) {
          Logger.error(error);
          statusModel.setStatus(STATUS_TYPES.APPLICATION_FAILURE);
        }

        if (typeof data.QueueUrls === 'undefined' || data.QueueUrls.length === 0) {
          statusModel.setStatus(STATUS_TYPES.APPLICATION_FAILURE);
        }

        resolve(statusModel);
      });
    });
  }

  /**
   * Get number of messages in a queue
   *
   * @param queue
   * @returns {Promise<any>}
   */
  getMessageCount(queue: string) {
    const container = this.getContainer();
    const queueUrl = this.queues[queue];
    const Logger = container.get(DEFINITIONS.LOGGER);
    const Timer = container.get(DEFINITIONS.TIMER);
    const timerId = `sqs-get-queue-attributes-${UUID()} - Queue: '${queueUrl}'`;

    return new Promise((resolve) => {
      Timer.start(timerId);

      this.sqs.getQueueAttributes(
        {
          AttributeNames: ['ApproximateNumberOfMessages'],
          QueueUrl: queueUrl,
        },
        (error, data) => {
          Timer.stop(timerId);

          if (error) {
            Logger.error(error);
            resolve(0);
          }

          resolve(Number.parseInt(data.Attributes.ApproximateNumberOfMessages, 10));
        },
      );
    });
  }

  /**
   * Publish to message queue
   *
   * When running within serverless-offline, messages can be published to a
   * local Lambda or SQS service instead of to AWS, depending on the offline
   * mode specified by `process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE`.
   *
   * @param queue          string
   * @param messageObject  object
   * @param messageGroupId string
   * @param {'catch' | 'throw'} failureMode Choose how failures are handled:
   *   - `catch`: errors will be caught and logged. This is the default.
   *   - `throw`: errors will be thrown, causing promise to reject.
   * @returns {Promise<any>}
   */
  async publish(queue: string, messageObject: object, messageGroupId = null, failureMode = SQS_PUBLISH_FAILURE_MODES.CATCH) {
    if (!Object.values(SQS_PUBLISH_FAILURE_MODES).includes(failureMode)) {
      throw new Error(`Invalid value for 'failureMode': ${failureMode}`);
    }

    const container = this.getContainer();
    const queueUrl = this.queues[queue];
    const Timer = container.get(DEFINITIONS.TIMER);
    const timerId = `sqs-send-message-${UUID()} - Queue: '${queueUrl}'`;

    Timer.start(timerId);

    const messageParameters = {
      MessageBody: JSON.stringify(messageObject),
      QueueUrl: queueUrl,
    };

    if (queueUrl.includes('.fifo')) {
      messageParameters.MessageDeduplicationId = UUID();
      messageParameters.MessageGroupId = messageGroupId !== null ? messageGroupId : UUID();
    }

    try {
      if (container.isOffline && this.constructor.offlineMode === SQS_OFFLINE_MODES.DIRECT) {
        await this.publishOffline(queue, messageParameters);
      } else {
        await this.sqs.sendMessage(messageParameters).promise();
      }
    } catch (error) {
      switch (failureMode) {
      case SQS_PUBLISH_FAILURE_MODES.CATCH:
        container.get(DEFINITIONS.LOGGER).error(error);

        return null;

      case SQS_PUBLISH_FAILURE_MODES.THROW:
      default:
        throw error;
      }
    }

    return queue;
  }

  /**
   * Sends a message to a queue consumer running in serverless-offline.
   *
   * This method invokes the consumer function directly instead of sending the
   * message to SQS, which requires a real or emulated SQS service not provided
   * by serverless-offline. This works very well for local testing.
   *
   * @param queue
   * @param messageParameters
   */
  async publishOffline(queue: string, messageParameters) {
    const container = this.getContainer();

    if (!container.isOffline) {
      throw new Error('Can only publishOffline while running serverless offline.');
    }

    const consumers = container.getConfiguration('QUEUE_CONSUMERS') || {};
    const FunctionName = consumers[queue];

    if (!FunctionName) {
      throw new Error(`Queue consumer for queue ${queue} was not found. Please configure your application's QUEUE_CONSUMERS.`);
    }

    const InvocationType = 'RequestResponse';

    const Payload = JSON.stringify({
      Records: [
        {
          body: messageParameters.MessageBody,
        },
      ],
    });

    const parameters = { FunctionName, InvocationType, Payload };

    await this.lambda.invoke(parameters).promise();
  }

  /**
   * Receive from message queue
   *
   * @param queue string
   * @param timeout number
   * @returns {Promise<any>}
   */
  receive(queue: string, timeout: number = 15) {
    const container = this.getContainer();
    const queueUrl = this.queues[queue];
    const Logger = container.get(DEFINITIONS.LOGGER);
    const Timer = container.get(DEFINITIONS.TIMER);
    const timerId = `sqs-receive-message-${UUID()} - Queue: '${queueUrl}'`;

    return new Promise((resolve, reject) => {
      Timer.start(timerId);

      this.sqs.receiveMessage(
        {
          QueueUrl: queueUrl,
          VisibilityTimeout: timeout,
          MaxNumberOfMessages: 10,
        },
        (error, data) => {
          Timer.stop(timerId);

          if (error) {
            Logger.error(error);
            return reject(error);
          }

          if (typeof data.Messages === 'undefined') {
            return resolve([]);
          }

          return resolve(data.Messages.map((message) => new SQSMessageModel(message)));
        },
      );
    });
  }
}
