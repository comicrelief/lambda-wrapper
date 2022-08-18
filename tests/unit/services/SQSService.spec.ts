import {
  Context,
  DependencyInjection,
  LambdaWrapperConfig,
  SQSService,
  WithSQSServiceConfig,
} from '@/src';

const config: LambdaWrapperConfig & WithSQSServiceConfig = {
  dependencies: {
    SQSService,
  },
  sqs: {
    queues: {
      submissions: 'service-name-stage-submissions.fifo',
    },
    queueConsumers: {
      submissions: 'SubmissionsConsumer',
    },
  },
};

const di = new DependencyInjection(config, {}, {} as Context);
const sqs = di.get(SQSService);

describe('unit.service.SQSService', () => {
  it('should load config from the `sqs` key', () => {
    expect(sqs.queues).toEqual(config.sqs?.queues);
    expect(sqs.queueConsumers).toEqual(config.sqs?.queueConsumers);
  });
});
