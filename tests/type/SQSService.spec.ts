import { expectTypeOf } from 'expect-type';

import lambdaWrapper, {
  DependencyInjection,
  QueueName,
  SQSService,
} from '../../src/index';
import { mockContext, mockEvent } from '../mocks/aws';

describe('type.SQSService', () => {
  const lwWithQueues = lambdaWrapper.configure({
    sqs: {
      queues: {
        test1: 'test-queue-1',
        test2: 'test-queue-2',
      },
    },
  });

  type expectedQueueNames = 'test1' | 'test2';

  const di = new DependencyInjection(lwWithQueues.config, mockEvent, mockContext);
  const sqs = di.get(SQSService);

  describe('QueueName', () => {
    it('should infer queue names from config', () => {
      // use our configured LambdaWrapper instance
      type queueName = QueueName<typeof lwWithQueues.config>;
      expectTypeOf<queueName>().toEqualTypeOf<expectedQueueNames>();
    });

    it('should infer `never` if no queues are configured', () => {
      // use the package's default out-of-the-box LambdaWrapper instance
      type queueName = QueueName<typeof lambdaWrapper.config>;
      expectTypeOf<queueName>().toBeNever();
    });
  });

  describe('batchDelete', () => {
    it('should accept only configured queue names', () => {
      expectTypeOf(sqs.batchDelete).parameter(0).toEqualTypeOf<expectedQueueNames>();
    });
  });

  describe('getMessageCount', () => {
    it('should accept only configured queue names', () => {
      expectTypeOf(sqs.getMessageCount).parameter(0).toEqualTypeOf<expectedQueueNames>();
    });
  });

  describe('publish', () => {
    it('should accept only configured queue names', () => {
      expectTypeOf(sqs.publish).parameter(0).toEqualTypeOf<expectedQueueNames>();
    });
  });

  describe('receive', () => {
    it('should accept only configured queue names', () => {
      expectTypeOf(sqs.receive).parameter(0).toEqualTypeOf<expectedQueueNames>();
    });
  });
});
