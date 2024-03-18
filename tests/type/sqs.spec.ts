import lambdaWrapper, {
  DependencyInjection,
  QueueName,
  SQSService,
} from '../../src/index';
import { mockContext, mockEvent } from '../mocks/aws';
import { Equal, Expect } from './helpers';

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

      type test = Expect<Equal<queueName, 'test1' | 'test2'>>;
    });

    it('should infer `never` if no queues are configured', () => {
      type queueName = QueueName<typeof lambdaWrapper.config>;

      type test = Expect<Equal<queueName, never>>;
    });
  });

  describe('publish', () => {
    it('should accept a configured queue name', () => {
      sqs.publish('test1', { message: 'test' });
    });

    it('should not accept any other string', () => {
      // @ts-expect-error
      sqs.publish('bad', { message: 'test' });
    });
  });
});
