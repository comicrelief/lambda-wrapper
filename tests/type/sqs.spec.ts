import { expectTypeOf } from 'expect-type';

import lambdaWrapper, {
  DependencyInjection,
  QueueName,
  SQSService,
} from '../../src/index';
import { mockContext, mockEvent } from '../mocks/aws';

describe('types.SQSService', () => {
  const lwWithQueues = lambdaWrapper.configure({
    sqs: {
      queues: {
        test1: 'test-queue-1',
        test2: 'test-queue-2',
      },
    },
  });

  const di = new DependencyInjection(lwWithQueues.config, mockEvent, mockContext);
  const sqs = di.get(SQSService);

  describe('QueueName', () => {
    it('should infer queue names from config', () => {
      type queueName = QueueName<typeof lwWithQueues.config>;

      expectTypeOf<queueName>().toEqualTypeOf<'test1' | 'test2'>();
    });

    it('should infer `never` if no queues are configured', () => {
      type queueName = QueueName<typeof lambdaWrapper.config>;

      expectTypeOf<queueName>().toBeNever();
    });
  });

  describe('publish', () => {
    it('should accept only configured queue names', () => {
      expectTypeOf(sqs.publish).parameter(0).toEqualTypeOf<'test1' | 'test2'>();
    });
  });
});
