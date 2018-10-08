/* @flow */
import Alai from 'alai';
import AWS from 'aws-sdk';
import each from 'async/each';
import UUID from 'uuid/v4';

import DependencyAwareClass from '../DependencyInjection/DependencyAware.class';
import DependencyInjection from '../DependencyInjection/DependencyInjection.class';
import StatusModel, { STATUS_TYPES } from '../Model/Status.model';
import SQSMessageModel from '../Model/SQS/Message.model';

import { DEFINITIONS } from '../Config/Dependencies';

const sqs = new AWS.SQS({
  region: process.env.REGION,
});

/**
 * SQSService class
 */
export default class SQSService extends DependencyAwareClass {
  /**
   * SQSService constructor
   * @param di DependencyInjection
   */
  constructor(di: DependencyInjection) {
    super(di);
    const context = this.getContainer().getContext();
    const queues = this.getContainer().getConfiguration('QUEUES');
    const isOffline = context.invokedFunctionArn.indexOf('offline') !== -1;

    this.queues = {};

    // Add the queues from configuration
    if (queues !== null && Object.keys(queues).length >= 1) {
      Object.keys(queues).forEach((queueDefinition) => {
        if (isOffline === true) {
          this.queues[queueDefinition] = `http://localhost:4576/queue/${queues[queueDefinition]}`;
        } else {
          this.queues[queueDefinition] = `https://sqs.${process.env.REGION}.amazonaws.com/${Alai.parse(context)}/${queues[queueDefinition]}`;
        }
      });
    }
  }

  /**
   * Batch delete messages
   * @param queue strung
   * @param messageModels [SQSMessageModel]
   * @return {Promise<any>}
   */
  batchDelete(queue: string, messageModels: [SQSMessageModel]) {
    const queueUrl = this.queues[queue];
    const Logger = this.getContainer().get(DEFINITIONS.LOGGER);
    const Timer = this.getContainer().get(DEFINITIONS.TIMER);

    return new Promise((resolve) => {
      const messagesForDeletion = [];

      Timer.start('sqs-batch-delete');
      // assuming openFiles is an array of file names
      each(messageModels, ((messageModel, callback) => {
        if (messageModel instanceof SQSMessageModel && messageModel.isForDeletion() === true) {
          messagesForDeletion.push({
            Id: messageModel.getMessageId(),
            ReceiptHandle: messageModel.getReceiptHandle(),
          });
        }
        callback();
      }), ((loopErr) => {
        if (loopErr) {
          Logger.error(loopErr);
          resolve();
        }

        sqs.deleteMessageBatch({
          Entries: messagesForDeletion,
          QueueUrl: queueUrl,
        }, ((err) => {
          Timer.stop('sqs-batch-delete');

          if (err) {
            Logger.error(err);
          }

          resolve();
        }));
      }));
    });
  }

  /**
   * Check SQS status
   * @return {Promise<any>}
   */
  checkStatus() {
    const Logger = this.getContainer().get(DEFINITIONS.LOGGER);
    const Timer = this.getContainer().get(DEFINITIONS.TIMER);

    return new Promise((resolve) => {
      Timer.start('sqs-list-queues');

      sqs.listQueues({}, ((err, data) => {
        Timer.stop('sqs-list-queues');

        const statusModel = new StatusModel('SQS', STATUS_TYPES.OK);

        if (err) {
          Logger.error(err);
          statusModel.setStatus(STATUS_TYPES.APPLICATION_FAILURE);
        }

        if (typeof data.QueueUrls === 'undefined' || data.QueueUrls.length === 0) {
          statusModel.setStatus(STATUS_TYPES.APPLICATION_FAILURE);
        }

        resolve(statusModel);
      }));
    });
  }

  /**
   * Get number of messages in a queue
   * @param queue
   * @return {Promise<any>}
   */
  getMessageCount(queue: string) {
    const queueUrl = this.queues[queue];
    const Logger = this.getContainer().get(DEFINITIONS.LOGGER);
    const Timer = this.getContainer().get(DEFINITIONS.TIMER);

    return new Promise((resolve) => {
      Timer.start('sqs-get-queue-attributes');

      sqs.getQueueAttributes({
        AttributeNames: ['ApproximateNumberOfMessages'],
        QueueUrl: queueUrl,
      }, ((err, data) => {
        Timer.stop('sqs-get-queue-attributes');

        if (err) {
          Logger.error(err);
          resolve(0);
        }

        resolve(parseInt(data.Attributes.ApproximateNumberOfMessages, 10));
      }));
    });
  }

  /**
   * Publish to message queue
   * @param queue          string
   * @param messageObject  object
   * @param messageGroupId string
   * @return {Promise<any>}
   */
  publish(queue: string, messageObject: object, messageGroupId = null) {
    const queueUrl = this.queues[queue];
    const Logger = this.getContainer().get(DEFINITIONS.LOGGER);
    const Timer = this.getContainer().get(DEFINITIONS.TIMER);

    return new Promise((resolve) => {
      Timer.start('sqs-send-message');

      sqs.sendMessage({
        MessageBody: JSON.stringify(messageObject),
        MessageDeduplicationId: UUID(),
        MessageGroupId: messageGroupId !== null ? messageGroupId : UUID(),
        QueueUrl: queueUrl,
      }, ((err) => {
        Timer.stop('sqs-stop-message');

        if (err) {
          Logger.error(err);
        }

        resolve({
          queue,
        });
      }));
    });
  }

  /**
   * Receive from message queue
   * @param queue string
   * @param timeout number
   * @return {Promise<any>}
   */
  receive(queue: string, timeout: number = 15) {
    const queueUrl = this.queues[queue];
    const Logger = this.getContainer().get(DEFINITIONS.LOGGER);
    const Timer = this.getContainer().get(DEFINITIONS.TIMER);

    return new Promise((resolve, reject) => {
      Timer.start('sqs-receive-message');

      sqs.receiveMessage({
        QueueUrl: queueUrl,
        VisibilityTimeout: timeout,
        MaxNumberOfMessages: 10,
      }, ((err, data) => {
        Timer.stop('sqs-receive-message');

        if (err) {
          Logger.error(err);
          return reject(err);
        }

        if (typeof data.Messages === 'undefined') {
          return resolve([]);
        }

        return resolve(data.Messages.map(message => new SQSMessageModel(message)));
      }));
    });
  }
}
