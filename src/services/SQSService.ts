import alai from 'alai';
import { each } from 'async';
import AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

import DependencyAwareClass from '../core/DependencyAwareClass';
import DependencyInjection from '../core/DependencyInjection';
import SQSMessageModel from '../models/SQSMessageModel';
import StatusModel, { STATUS_TYPES } from '../models/StatusModel';
import LoggerService from './LoggerService';
import TimerService from './TimerService';

export interface SQSServiceConfig {
  /**
   * Maps short friendly queue names to the full SQS queue name.
   *
   * Usually we define queue names in our `serverless.yml` and provide them to
   * the application via environment variables. Example:
   *
   * ```ts
   * {
   *   queues: {
   *     submissions: process.env.SQS_QUEUE_SUBMISSIONS,
   *   }
   * }
   * ```
   */
  queues?: Record<string, string>;
  /**
   * Maps short friendly queue names to the queue consumer function name, for
   * use with offline SQS emulation. Example:
   *
   * ```ts
   * {
   *   queueConsumers: {
   *     submissions: 'SubmissionConsumer',
   *   }
   * }
   * ```
   *
   * See the [SQSService docs](../../docs/services/SQSService.md) for details
   * about how this works.
   */
  queueConsumers?: Record<string, string>;
}

export interface WithSQSServiceConfig {
  sqs?: SQSServiceConfig;
}

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
 * Defines the preferred behaviour for `SQSService.prototype.send` in case the
 * AWS SQS call fails.
 */
export const SQS_PUBLISH_FAILURE_MODES = {
  /**
   * Catch the exception and logs it.
   *
   * This is the default behaviour for Lambda Wrapper v1.8.0 and below and for
   * Lambda Wrapper v1.8.2 and above.
   */
  CATCH: 'catch',

  /**
   * Throw the exception so that the caller can handle it directly.
   */
  THROW: 'throw',
} as const;

/**
 * Helper service for working with SQS.
 *
 * Config for this service goes in the `sqs` key of your Lambda Wrapper config.
 * The `queues` key maps short friendly names to the full SQS queue name.
 * Usually we define queue names in our `serverless.yml` and provide them to
 * the application via environment variables.
 *
 * ```ts
 * const lambdaWrapper = lw.configure({
 *   sqs: {
 *     queues: {
 *       // add an entry for each queue mapping to its AWS name
 *       submissions: process.env.SQS_QUEUE_SUBMISSIONS,
 *     },
 *   },
 * });
 * ```
 *
 * You can then send messages to a queue within your Lambda handler using the
 * `publish` method.
 *
 * ```ts
 * export default lambdaWrapper.wrap(async (di) => {
 *   const sqs = di.get(SQSService);
 *   const message = { data: 'Hello SQS!' };
 *   await sqs.publish('submissions', message);
 * });
 * ```
 */
export default class SQSService extends DependencyAwareClass {
  readonly queues: Record<string, string>;

  readonly queueConsumers: Record<string, string>;

  readonly queueUrls: Record<string, string>;

  private $sqs?: AWS.SQS;

  private $lambda?: AWS.Lambda;

  constructor(di: DependencyInjection) {
    super(di);

    const config = (this.di.config as WithSQSServiceConfig).sqs;
    this.queues = config?.queues || {};
    this.queueConsumers = config?.queueConsumers || {};

    const {
      LAMBDA_WRAPPER_OFFLINE_SQS_HOST: offlineHost = 'localhost',
      LAMBDA_WRAPPER_OFFLINE_SQS_PORT: offlinePort = '4576',
      LAMBDA_WRAPPER_OFFLINE_SQS_MODE: offlineMode = SQS_OFFLINE_MODES.DIRECT,
      AWS_ACCOUNT_ID,
      REGION,
    } = process.env;

    const accountId = (di.context.invokedFunctionArn && alai.parse(di.context))
      || AWS_ACCOUNT_ID;

    if (di.isOffline && !Object.values(SQS_OFFLINE_MODES).includes(offlineMode)) {
      throw new Error(`Invalid LAMBDA_WRAPPER_OFFLINE_SQS_MODE: ${offlineMode}\n`
        + `Please use one of: ${Object.values(SQS_OFFLINE_MODES).join(', ')}`);
    }

    const useLocalQueues = di.isOffline && offlineMode === SQS_OFFLINE_MODES.LOCAL;
    this.queueUrls = Object.fromEntries(
      Object.entries(this.queues).map((
        ([key, queueName]) => [key, useLocalQueues
          ? `http://${offlineHost}:${offlinePort}/queue/${queueName}`
          : `https://sqs.${REGION}.amazonaws.com/${accountId}/${queueName}`]
      )),
    );
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
   * Batch delete messages.
   *
   * @param queue
   * @param messageModels
   */
  batchDelete(queue: string, messageModels: SQSMessageModel[]): Promise<void> {
    const queueUrl = this.queueUrls[queue];
    const logger = this.di.get(LoggerService);
    const timer = this.di.get(TimerService);
    const timerId = `sqs-batch-delete-${uuid()} - Queue: '${queueUrl}'`;

    return new Promise<void>((resolve) => {
      const messagesForDeletion: { Id: string; ReceiptHandle: string }[] = [];

      timer.start(timerId);
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
            logger.error(loopError);
            resolve();
          }

          this.sqs.deleteMessageBatch(
            {
              Entries: messagesForDeletion,
              QueueUrl: queueUrl,
            },
            (error) => {
              timer.stop(timerId);

              if (error) {
                logger.error(error);
              }

              resolve();
            },
          );
        },
      );
    });
  }

  /**
   * Check SQS status.
   */
  checkStatus() {
    const logger = this.di.get(LoggerService);
    const timer = this.di.get(TimerService);
    const timerId = `sqs-list-queues-${uuid()}`;

    return new Promise((resolve) => {
      timer.start(timerId);

      this.sqs.listQueues({}, (error, data) => {
        timer.stop(timerId);

        const statusModel = new StatusModel('SQS', STATUS_TYPES.OK);

        if (error) {
          logger.error(error);
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
   * Get the approximate number of messages in a queue.
   *
   * @param queue
   */
  getMessageCount(queue: string): Promise<number> {
    const queueUrl = this.queueUrls[queue];
    const logger = this.di.get(LoggerService);
    const timer = this.di.get(TimerService);
    const timerId = `sqs-get-queue-attributes-${uuid()} - Queue: '${queueUrl}'`;

    return new Promise((resolve) => {
      timer.start(timerId);

      this.sqs.getQueueAttributes(
        {
          AttributeNames: ['ApproximateNumberOfMessages'],
          QueueUrl: queueUrl,
        },
        (error, data) => {
          timer.stop(timerId);

          if (error) {
            logger.error(error);
            resolve(0);
          }

          const messageCount = data.Attributes?.ApproximateNumberOfMessages || '0';
          resolve(Number.parseInt(messageCount, 10));
        },
      );
    });
  }

  /**
   * Publish to message queue.
   *
   * When running within serverless-offline, messages can be published to a
   * local Lambda or SQS service instead of to AWS, depending on the offline
   * mode specified by `process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE`.
   *
   * @param queue          string
   * @param messageObject  object
   * @param messageGroupId string
   * @param failureMode Choose how failures are handled:
   *   - `catch`: errors will be caught and logged. This is the default.
   *   - `throw`: errors will be thrown, causing promise to reject.
   */
  async publish(queue: string, messageObject: object, messageGroupId = null, failureMode: 'catch' | 'throw' = SQS_PUBLISH_FAILURE_MODES.CATCH) {
    if (!Object.values(SQS_PUBLISH_FAILURE_MODES).includes(failureMode)) {
      throw new Error(`Invalid value for 'failureMode': ${failureMode}`);
    }

    const queueUrl = this.queueUrls[queue];
    const timer = this.di.get(TimerService);
    const timerId = `sqs-send-message-${uuid()} - Queue: '${queueUrl}'`;

    timer.start(timerId);

    const messageParameters: AWS.SQS.SendMessageRequest = {
      MessageBody: JSON.stringify(messageObject),
      QueueUrl: queueUrl,
    };

    if (queueUrl.includes('.fifo')) {
      messageParameters.MessageDeduplicationId = uuid();
      messageParameters.MessageGroupId = messageGroupId !== null ? messageGroupId : uuid();
    }

    try {
      if (this.di.isOffline && SQSService.offlineMode === SQS_OFFLINE_MODES.DIRECT) {
        await this.publishOffline(queue, messageParameters);
      } else {
        await this.sqs.sendMessage(messageParameters).promise();
      }
    } catch (error) {
      if (failureMode === SQS_PUBLISH_FAILURE_MODES.CATCH) {
        this.di.get(LoggerService).error(error);
        return null;
      }
      throw error;
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
  async publishOffline(queue: string, messageParameters: AWS.SQS.SendMessageRequest) {
    if (!this.di.isOffline) {
      throw new Error('Can only publishOffline while running serverless offline.');
    }

    const FunctionName = this.queueConsumers[queue];

    if (!FunctionName) {
      throw new Error(
        `Queue consumer for queue ${queue} was not found. Please add it to `
        + 'the sqs.queueConsumers key in your Lambda Wrapper config.',
      );
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
   */
  receive(queue: string, timeout = 15): Promise<SQSMessageModel[]> {
    const queueUrl = this.queueUrls[queue];
    const logger = this.di.get(LoggerService);
    const timer = this.di.get(TimerService);
    const timerId = `sqs-receive-message-${uuid()} - Queue: '${queueUrl}'`;

    return new Promise((resolve, reject) => {
      timer.start(timerId);

      this.sqs.receiveMessage(
        {
          QueueUrl: queueUrl,
          VisibilityTimeout: timeout,
          MaxNumberOfMessages: 10,
        },
        (error, data) => {
          timer.stop(timerId);

          if (error) {
            logger.error(error);
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
