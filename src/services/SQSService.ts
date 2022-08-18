import { SQS } from 'aws-sdk';

import DependencyAwareClass from '../core/dependency-base';
import DependencyInjection from '../core/dependency-injection';

export interface SQSServiceConfig {
  queues?: Record<string, string>;
  queueConsumers?: Record<string, string>;
}

export interface WithSQSServiceConfig {
  sqs?: SQSServiceConfig;
}

/**
 * Helper service for working with SQS.
 *
 * Config for this service goes in the `sqs` key of your Lambda Wrapper config.
 * TODO: more about config
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
