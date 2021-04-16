import { DEFINITIONS } from '../../../src/Config/Dependencies';
import DependencyInjection from '../../../src/DependencyInjection/DependencyInjection.class';

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
    QUEUES: { TEST_QUEUE },
    QUEUE_CONSUMERS: { TEST_QUEUE },
  }, {}, {
    invokedFunctionArn: isOffline ? 'offline' : 'arn:aws:lambda:eu-west-1:0000:test',
  });

  const service = di.get(DEFINITIONS.SQS);
  const sqs = {
    sendMessage: createAsyncMock(sendMessage),
  };

  const lambda = {
    invoke: createAsyncMock(invoke),
  };

  jest.spyOn(service, 'sqs', 'get').mockReturnValue(sqs);
  jest.spyOn(service, 'lambda', 'get').mockReturnValue(lambda);

  return service;
};

describe('Service/SQS', () => {
  beforeAll(() => {
    process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE = undefined;
  });

  afterAll(() => {
    delete process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE;
  });

  describe('publish', () => {
    describe('when container.isOffline === false', () => {
      [
        ['sends to SQS', undefined],
        ['sends to SQS, even in "lambda" offline mode', 'lambda'],
        ['sends to SQS, even in "sqs" offline mode', 'sqs'],
        ['sends to SQS, even in "none" offline mode', 'none'],
        ['sends to SQS, even in "invalid" offline mode', 'invalid'],
      ].forEach(([description, offlineMode]) => {
        it(description, async () => {
          process.env.CURRENT_TEST = `SQS/publish/ONLINE/${description}`;
          process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE = offlineMode;
          const service = getService({}, false);

          await service.publish(TEST_QUEUE, { test: 1 });

          expect(service.sqs.sendMessage).toHaveBeenCalledTimes(1);
          expect(service.lambda.invoke).toHaveBeenCalledTimes(0);

          const params = service.sqs.sendMessage.mock.calls[0][0];
          expect(params.QueueUrl).not.toContain('localhost');
        });
      });
    });

    describe('when container.isOffline === true', () => {
      it('sends a lambda request by default', async () => {
        process.env.CURRENT_TEST = 'SQS/publish/offline/default';
        delete process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE;
        const service = getService({}, true);

        await service.publish(TEST_QUEUE, { test: 1 });

        expect(service.sqs.sendMessage).toHaveBeenCalledTimes(0);
        expect(service.lambda.invoke).toHaveBeenCalledTimes(1);
      });

      it('sends a lambda request in "lambda" mode', async () => {
        process.env.CURRENT_TEST = 'SQS/publish/offline/lambda';
        process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE = 'lambda';
        const service = getService({}, true);

        await service.publish(TEST_QUEUE, { test: 1 });

        expect(service.sqs.sendMessage).toHaveBeenCalledTimes(0);
        expect(service.lambda.invoke).toHaveBeenCalledTimes(1);
      });

      it('sends a local SQS request in "sqs" mode', async () => {
        process.env.CURRENT_TEST = 'SQS/publish/offline/sqs';
        process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE = 'sqs';
        const service = getService({}, true);

        await service.publish(TEST_QUEUE, { test: 1 });

        expect(service.sqs.sendMessage).toHaveBeenCalledTimes(1);
        expect(service.lambda.invoke).toHaveBeenCalledTimes(0);

        const params = service.sqs.sendMessage.mock.calls[0][0];
        expect(params.QueueUrl).toContain('localhost');
      });

      it('sends a normal SQS request in "none" mode', async () => {
        process.env.CURRENT_TEST = 'SQS/publish/offline/none';
        process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE = 'none';
        const service = getService({}, true);

        await service.publish(TEST_QUEUE, { test: 1 });

        expect(service.sqs.sendMessage).toHaveBeenCalledTimes(1);
        expect(service.lambda.invoke).toHaveBeenCalledTimes(0);

        const params = service.sqs.sendMessage.mock.calls[0][0];
        expect(params.QueueUrl).not.toContain('localhost');
      });

      it('throws an error for any other mode', async () => {
        process.env.CURRENT_TEST = 'SQS/publish/offline/invalid';
        process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE = 'invalid';
        expect(() => getService({}, true)).toThrow();
      });
    });
  });
});
