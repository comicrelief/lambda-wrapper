import {
  InvokeCommand,
  LambdaClient,
} from '@aws-sdk/client-lambda';
import {
  DeleteMessageBatchCommand,
  GetQueueAttributesCommand,
  ListQueuesCommand,
  ReceiveMessageCommand,
  SQSClient,
  SendMessageCommand,
  SendMessageCommandInput,
} from '@aws-sdk/client-sqs';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import alai from 'alai';
import { each } from 'async';
import { v4 as uuid } from 'uuid';

import DependencyAwareClass from '../core/DependencyAwareClass';
import DependencyInjection from '../core/DependencyInjection';
import { LambdaWrapperConfig } from '../core/config';
import SQSMessageModel from '../models/SQSMessageModel';
import { ServiceStatus, Status } from '../types/Status';
import LoggerService from './LoggerService';
import TimerService from './TimerService';

export interface SQSServiceConfig {
  /**
   * Maps short friendly queue names to the full SQS queue name.
   *
   * Usually we define queue names in our `serverless.yml` and provide them to
   * the application via environment variables. If you haven't defined types
   * for your env vars, you'll need to coerce them to `string`.
   *
   * Example:
   *
   * ```ts
   * {
   *   queues: {
   *     submissions: process.env.SQS_QUEUE_SUBMISSIONS as string,
   *   }
   * }
   * ```
   */
  queues?: object;
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
 * Type of a queue name taken from the Lambda Wrapper config type.
 *
 * If the `sqs` config key is absent, the resulting type is `never` (since no
 * queues are defined).
 */
export type QueueName<TConfig extends WithSQSServiceConfig> =
  TConfig extends { sqs: { queues: Record<infer Key, string> } }
    ? string & Key
    : never;

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
 *       submissions: process.env.SQS_QUEUE_SUBMISSIONS as string,
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
 *
 * When using TypeScript, queue names are inferred from your Lambda Wrapper
 * config so that IntelliSense can provide hints and TypeScript will tell you
 * at compile-time if you try to publish to an undefined queue.
 *
 * ```ts
 * // ok
 * await sqs.publish('submissions', message);
 *
 * // error: Argument of type '"submission"' is not assignable to parameter of
 * // type '"submissions"'.
 * await sqs.publish('submission', message);
 * ```
 *
 * Note that if you're passing the queue name in as a variable, you'll need to
 * ensure the variable type is specific enough and not simply `string`. If you
 * have a list of queue names you will need to declare it `as const`. Otherwise,
 * use string literal types, or the `QueueName` generic type which extracts the
 * type of all queue names from your Lambda Wrapper config.
 *
 * ```ts
 * const myQueues = ['queue1', 'queue2'];
 * for (const queue of myQueues) {
 *   // won't compile because `queue` is of type `string`
 *   await sqs.publish(queue, message);
 * }
 *
 * const myQueues = ['queue1', 'queue2'] as const;
 * for (const queue of myQueues) {
 *   // ok now because `queue` is of type `"queue1" | "queue2"`
 *   await sqs.publish(queue, message);
 * }
 *
 * // you can also simply use string literal types
 * let queue: "queue1" | "queue2";
 *
 * // or accept any queue defined in the config using `QueueName`
 * let queue: QueueName<typeof lambdaWrapper.config>;
 * ```
 *
 * This is all pretty cool, but the current implementation has a caveat: the
 * `WithSQSServiceConfig` type has to be a little vague about `sqs.queues` in
 * order to get TypeScript to infer its keys. The following config will not
 * raise any errors itself, but is invalid and will make the `QueueName` type
 * `never`.
 *
 * ```ts
 * lambdaWrapper.configure<WithSQSServiceConfig>({
 *   sqs: {
 *     queues: {
 *       good: 'good-queue',
 *       bad: 0, // oops, not a string, but no errors here!
 *     },
 *   },
 * });
 *
 * // even though this is queue has valid config, the invalid one breaks it:
 * // Argument of type 'string' is not assignable to parameter of type 'never'.
 * await sqs.publish('good', message);
 * ```
 *
 * If you start getting _not assignable to parameter of type 'never'_ errors on
 * all your `SQSService` method calls, double-check that your config is correct.
 * Be particularly careful with environment variables – by default they have
 * type `string | undefined`. In the first example at the top of this page, a
 * type assertion was used to coerce this to `string`.
 */
export default class SQSService<
  TConfig extends LambdaWrapperConfig & WithSQSServiceConfig = any,
> extends DependencyAwareClass {
  readonly queues: Record<QueueName<TConfig>, string>;

  readonly queueConsumers: Record<QueueName<TConfig>, string>;

  readonly queueUrls: Record<QueueName<TConfig>, string>;

  private $sqs?: SQSClient;

  private $lambda?: LambdaClient;

  constructor(di: DependencyInjection<TConfig>) {
    super(di);

    const config = this.di.config.sqs;
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
    ) as Record<QueueName<TConfig>, string>;
  }

  /**
   * Returns an SQS client instance
   */
  get sqs() {
    if (!this.$sqs) {
      this.$sqs = new SQSClient({
        region: process.env.REGION,
        requestHandler: new NodeHttpHandler({
          // longest publish on NOTV took 5 seconds
          connectionTimeout: 8 * 1000,
          socketTimeout: 8 * 1000,
        }),
        maxAttempts: 4, // default from AWS SDK v2 was 3 retries for SQS
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
      this.$lambda = new LambdaClient({
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
  batchDelete(queue: QueueName<TConfig>, messageModels: SQSMessageModel[]): Promise<void> {
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

          this.sqs.send(new DeleteMessageBatchCommand({
            Entries: messagesForDeletion,
            QueueUrl: queueUrl,
          })).finally(() => {
            timer.stop(timerId);
          }).catch((error) => {
            logger.error(error);
          }).then(() => {
            resolve();
          });
        },
      );
    });
  }

  /**
   * Check SQS status.
   */
  checkStatus(): Promise<ServiceStatus> {
    const logger = this.di.get(LoggerService);
    const timer = this.di.get(TimerService);
    const timerId = `sqs-list-queues-${uuid()}`;

    return new Promise((resolve) => {
      timer.start(timerId);

      let status: Status = 'OK';

      this.sqs.send(new ListQueuesCommand())
        .finally(() => {
          timer.stop(timerId);
        })
        .then((data) => {
          if (typeof data.QueueUrls === 'undefined' || data.QueueUrls.length === 0) {
            status = 'APPLICATION_FAILURE';
          }
        })
        .catch((error) => {
          logger.error(error);
          status = 'APPLICATION_FAILURE';
        })
        .then(() => {
          resolve({
            service: 'SQS',
            status,
          });
        });
    });
  }

  /**
   * Get the approximate number of messages in a queue.
   *
   * @param queue
   */
  getMessageCount(queue: QueueName<TConfig>): Promise<number> {
    const queueUrl = this.queueUrls[queue];
    const logger = this.di.get(LoggerService);
    const timer = this.di.get(TimerService);
    const timerId = `sqs-get-queue-attributes-${uuid()} - Queue: '${queueUrl}'`;

    return new Promise((resolve) => {
      timer.start(timerId);

      this.sqs.send(new GetQueueAttributesCommand({
        AttributeNames: ['ApproximateNumberOfMessages'],
        QueueUrl: queueUrl,
      })).finally(() => {
        timer.stop(timerId);
      }).then((data) => {
        const messageCount = data.Attributes?.ApproximateNumberOfMessages || '0';
        resolve(Number.parseInt(messageCount, 10));
      }).catch((error) => {
        logger.error(error);
        resolve(0);
      });
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
   *   - `throw`: errors will be thrown, causing promise to reject. (default)
   *   - `catch`: errors will be caught and logged. Useful for non-critical
   *     messages.
   */
  async publish(queue: QueueName<TConfig>, messageObject: object, messageGroupId = null, failureMode: 'catch' | 'throw' = SQS_PUBLISH_FAILURE_MODES.THROW) {
    if (!Object.values(SQS_PUBLISH_FAILURE_MODES).includes(failureMode)) {
      throw new Error(`Invalid value for 'failureMode': ${failureMode}`);
    }

    const queueUrl = this.queueUrls[queue];
    const timer = this.di.get(TimerService);
    const timerId = `sqs-send-message-${uuid()} - Queue: '${queueUrl}'`;

    timer.start(timerId);

    const messageParameters: SendMessageCommandInput = {
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
        await this.sqs.send(new SendMessageCommand(messageParameters));
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
  async publishOffline(queue: QueueName<TConfig>, messageParameters: SendMessageCommandInput) {
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

    await this.lambda.send(new InvokeCommand({
      FunctionName,
      InvocationType,
      Payload,
    }));
  }

  /**
   * Receive from message queue
   *
   * @param queue string
   * @param timeout number
   */
  receive(queue: QueueName<TConfig>, timeout = 15): Promise<SQSMessageModel[]> {
    const queueUrl = this.queueUrls[queue];
    const logger = this.di.get(LoggerService);
    const timer = this.di.get(TimerService);
    const timerId = `sqs-receive-message-${uuid()} - Queue: '${queueUrl}'`;

    return new Promise((resolve, reject) => {
      timer.start(timerId);

      this.sqs.send(new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        VisibilityTimeout: timeout,
        MaxNumberOfMessages: 10,
      })).finally(() => {
        timer.stop(timerId);
      }).then((data) => {
        if (typeof data.Messages === 'undefined') {
          resolve([]);
        } else {
          resolve(data.Messages.map((message) => new SQSMessageModel(message)));
        }
      }).catch((error) => {
        logger.error(error);
        reject(error);
      });
    });
  }
}
