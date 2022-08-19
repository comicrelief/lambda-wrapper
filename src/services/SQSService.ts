import { SQS } from 'aws-sdk';

import DependencyAwareClass from '../core/dependency-base';
import DependencyInjection from '../core/dependency-injection';

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
 * `send` method.
 *
 * ```ts
 * export default lambdaWrapper.wrap(async (di) => {
 *   const sqs = di.get(SQSService);
 *   const message = { data: 'Hello SQS!' };
 *   await sqs.send('submissions', message);
 * });
 * ```
 */
export default class SQSService extends DependencyAwareClass {
  private readonly sqs = new SQS({
    region: process.env.REGION,
    httpOptions: {
      connectTimeout: 8 * 1000, // longest publish on NOTV took 5 seconds
      timeout: 8 * 1000,
    },
    maxRetries: 3, // default is 3, we can change that
  });

  readonly queues: Record<string, string>;

  readonly queueConsumers: Record<string, string>;

  constructor(di: DependencyInjection) {
    super(di);

    const config = (this.di.config as WithSQSServiceConfig).sqs;
    this.queues = config?.queues || {};
    this.queueConsumers = config?.queueConsumers || {};
  }

  async send(queue: string, message: any): Promise<void> {
    await this.sqs.sendMessage({
      QueueUrl: queue,
      MessageBody: message,
    }).promise();
  }
}
