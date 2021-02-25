/* @flow */
import Alai from 'alai';
import each from 'async/each';
import AWS from 'aws-sdk';
import { v4 as UUID } from 'uuid';

import { DEFINITIONS } from '../Config/Dependencies';
import DependencyAwareClass from '../DependencyInjection/DependencyAware.class';
import DependencyInjection from '../DependencyInjection/DependencyInjection.class';
import SQSMessageModel from '../Model/SQS/Message.model';
import StatusModel, { STATUS_TYPES } from '../Model/Status.model';

// Set a timeout on S3 in case of outage
AWS.Config.httpOptions = {
  connectTimeout: 25000,
  timeout: 25000,
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
    const container = this.getContainer();
    const context = container.getContext();
    const queues = container.getConfiguration('QUEUES');

    this.queues = {};

    this.$lambda = null;
    this.$sqs = null;

    // Add the queues from configuration
    if (queues !== null && Object.keys(queues).length > 0) {
      Object.keys(queues).forEach((queueDefinition) => {
        if (container.isOffline) {
          const offlineHost = process.env.LAMBDA_WRAPPER_OFFLINE_SQS_HOST || 'localhost';

          this.queues[queueDefinition] = `http://${offlineHost}:4576/queue/${queues[queueDefinition]}`;
        } else {
          this.queues[queueDefinition] = `https://sqs.${process.env.REGION}.amazonaws.com/${Alai.parse(context)}/${queues[queueDefinition]}`;
        }
      });
    }
  }

  /**
   * Returns an SQS client instance
   */
  // eslint-disable-next-line class-methods-use-this
  get sqs() {
    if (!this.$sqs) {
      this.$sqs = new AWS.SQS({
        region: process.env.REGION,
      });
    }

    return this.$sqs;
  }

  /**
   * Returns a Lambda client instance
   */
  // eslint-disable-next-line class-methods-use-this
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
   * @param queue          string
   * @param messageObject  object
   * @param messageGroupId string
   * @returns {Promise<any>}
   */
  async publish(queue: string, messageObject: object, messageGroupId = null) {
    const container = this.getContainer();
    const queueUrl = this.queues[queue];
    const Logger = container.get(DEFINITIONS.LOGGER);
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
      if (container.isOffline) {
        await this.publishOffline(queue, messageParameters);
      } else {
        await this.sqs.sendMessage(messageParameters).promise();
      }
    } catch (error) {
      Logger.error(error);
    }

    return queue;
  }

  /**
   * Publishes a message in to the queue
   * via serverless offline
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

    // Don't await the promise, otherwise
    // we will have all Lambdas hang until
    // all queued invocations are completed
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
