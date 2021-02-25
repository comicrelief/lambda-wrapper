import DependencyInjection from '../../../src/DependencyInjection/DependencyInjection.class';
import SQSService from '../../../src/Service/SQS.service';

const createAsyncMock = (returnValue) => {
  const mockedValue = returnValue instanceof Error
    ? Promise.reject(returnValue)
    : Promise.resolve(returnValue);

  return jest.fn().mockReturnValue({ promise: () => mockedValue });
};

const TEST_QUEUE = 'TEST_QUEUE';

/**
 * Generates a SQSService
 *
 * @param {*} param0
 * @param isOffline
 * @returns {SQSService}
 */
const getService = ({ sendMessage = null, invoke = null } = {}, isOffline = false) => {
  const di = new DependencyInjection({
    QUEUE_CONSUMERS: { TEST_QUEUE },
  }, {}, {});
  const service = new SQSService(di);
  const sqs = {
    sendMessage: createAsyncMock(sendMessage),
  };

  const lambda = {
    invoke: createAsyncMock(invoke),
  };

  jest.spyOn(service, 'sqs', 'get').mockReturnValue(sqs);
  jest.spyOn(service, 'lambda', 'get').mockReturnValue(lambda);
  jest.spyOn(di, 'isOffline', 'get').mockReturnValue(isOffline);

  return service;
};

describe('Service/SQS', () => {
  describe('publish', () => {
    it('publishes on SQS if container.isOffline === false', async () => {
      const service = getService({}, false);
      service.queues.TEST_QUEUE = 'TEST_QUEUE';

      await service.publish(service.queues.TEST_QUEUE, { test: 1 });

      expect(service.sqs.sendMessage).toHaveBeenCalledTimes(1);
      expect(service.lambda.invoke).toHaveBeenCalledTimes(0);
    });

    it('sends a lambda request if container.isOffline === true', async () => {
      const service = getService({}, true);
      service.queues.TEST_QUEUE = 'TEST_QUEUE';

      await service.publish(service.queues.TEST_QUEUE, { test: 1 });

      expect(service.sqs.sendMessage).toHaveBeenCalledTimes(0);
      expect(service.lambda.invoke).toHaveBeenCalledTimes(1);
    });
  });
});
