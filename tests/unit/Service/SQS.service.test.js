import { DEFINITIONS } from '../../../src/Config/Dependencies';
import DependencyInjection from '../../../src/DependencyInjection/DependencyInjection.class';
import { SQS_PUBLISH_FAILURE_MODES } from '../../../src/Service/SQS.service';

const createAsyncMock = (returnValue) => {
  const mockedValue = returnValue instanceof Error
    ? Promise.reject(returnValue)
    : Promise.resolve(returnValue);

  return jest.fn().mockReturnValue({ promise: () => mockedValue });
};

const TEST_QUEUE = 'TEST_QUEUE';

/**
 * Generates a SQSService
 * @param {*} param0
 * @param isOffline
 * @returns {SQSService}
 */
const getService = ({ sendMessage = null, invoke = null } = {}, isOffline = false) => {
  const di = new DependencyInjection({
    QUEUES: { [TEST_QUEUE]: 'QueueName' },
    QUEUE_CONSUMERS: { TEST_QUEUE },
  }, {}, {
    invokedFunctionArn: isOffline ? 'offline' : 'arn:aws:lambda:eu-west-1:0123456789:test',
  });

  const logger = di.get(DEFINITIONS.LOGGER);

  jest.spyOn(logger, 'error').mockImplementation();

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
  let envAccountId;
  let envOfflineSqsMode;
  let envOfflineSqsHost;
  let envOfflineSqsPort;
  let envRegion;

  beforeAll(() => {
    envAccountId = process.env.AWS_ACCOUNT_ID;
    envOfflineSqsMode = process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE;
    envOfflineSqsHost = process.env.LAMBDA_WRAPPER_OFFLINE_SQS_HOST;
    envOfflineSqsPort = process.env.LAMBDA_WRAPPER_OFFLINE_SQS_PORT;
    envRegion = process.env.REGION;
  });

  afterAll(() => {
    process.env.AWS_ACCOUNT_ID = envAccountId;
    process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE = envOfflineSqsMode;
    process.env.LAMBDA_WRAPPER_OFFLINE_SQS_HOST = envOfflineSqsHost;
    process.env.LAMBDA_WRAPPER_OFFLINE_SQS_PORT = envOfflineSqsPort;
    process.env.REGION = envRegion;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('publish', () => {
    describe('when container.isOffline === false', () => {
      [
        ['sends to SQS', undefined],
        ['sends to SQS, even in "direct" offline mode', 'direct'],
        ['sends to SQS, even in "local" offline mode', 'local'],
        ['sends to SQS, even in "aws" offline mode', 'aws'],
        ['sends to SQS, even in "invalid" offline mode', 'invalid'],
      ].forEach(([description, offlineMode]) => {
        it(description, async () => {
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
        delete process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE;
        const service = getService({}, true);

        await service.publish(TEST_QUEUE, { test: 1 });

        expect(service.sqs.sendMessage).toHaveBeenCalledTimes(0);
        expect(service.lambda.invoke).toHaveBeenCalledTimes(1);
      });

      it('sends a lambda request in "direct" mode', async () => {
        process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE = 'direct';
        const service = getService({}, true);

        await service.publish(TEST_QUEUE, { test: 1 });

        expect(service.sqs.sendMessage).toHaveBeenCalledTimes(0);
        expect(service.lambda.invoke).toHaveBeenCalledTimes(1);
      });

      it('sends a local SQS request in "local" mode', async () => {
        delete process.env.LAMBDA_WRAPPER_OFFLINE_SQS_HOST;
        delete process.env.LAMBDA_WRAPPER_OFFLINE_SQS_PORT;
        process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE = 'local';
        const service = getService({}, true);

        await service.publish(TEST_QUEUE, { test: 1 });

        expect(service.sqs.sendMessage).toHaveBeenCalledTimes(1);
        expect(service.lambda.invoke).toHaveBeenCalledTimes(0);

        const params = service.sqs.sendMessage.mock.calls[0][0];
        expect(params.QueueUrl).toContain('localhost');
        expect(params.QueueUrl).toContain('4576');
      });

      it('sends a normal SQS request in "aws" mode', async () => {
        process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE = 'aws';
        const service = getService({}, true);

        await service.publish(TEST_QUEUE, { test: 1 });

        expect(service.sqs.sendMessage).toHaveBeenCalledTimes(1);
        expect(service.lambda.invoke).toHaveBeenCalledTimes(0);

        const params = service.sqs.sendMessage.mock.calls[0][0];
        expect(params.QueueUrl).not.toContain('localhost');
        expect(params.QueueUrl).not.toContain('4576');
      });

      it('throws an error for any other mode', async () => {
        process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE = 'invalid';
        expect(() => getService({}, true)).toThrow();
      });
    });

    describe('queue URLs', () => {
      describe('when container.isOffline === false', () => {
        it('should use a correctly formed AWS queue URL', async () => {
          delete process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE;
          process.env.REGION = 'eu-west-1';
          const service = getService({}, false);

          await service.publish(TEST_QUEUE, { test: 1 });

          const params = service.sqs.sendMessage.mock.calls[0][0];
          expect(params.QueueUrl).toEqual('https://sqs.eu-west-1.amazonaws.com/0123456789/QueueName');
        });
      });

      describe('when container.isOffline === true', () => {
        it('should use a LocalStack URL in "local" mode', async () => {
          delete process.env.LAMBDA_WRAPPER_OFFLINE_SQS_HOST;
          delete process.env.LAMBDA_WRAPPER_OFFLINE_SQS_PORT;
          process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE = 'local';
          const service = getService({}, true);

          await service.publish(TEST_QUEUE, { test: 1 });

          const params = service.sqs.sendMessage.mock.calls[0][0];
          expect(params.QueueUrl).toEqual('http://localhost:4576/queue/QueueName');
        });

        it('should use a custom host in "local" mode', async () => {
          delete process.env.LAMBDA_WRAPPER_OFFLINE_SQS_PORT;
          process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE = 'local';
          process.env.LAMBDA_WRAPPER_OFFLINE_SQS_HOST = 'custom-host';
          const service = getService({}, true);

          await service.publish(TEST_QUEUE, { test: 1 });

          const params = service.sqs.sendMessage.mock.calls[0][0];
          expect(params.QueueUrl).toEqual('http://custom-host:4576/queue/QueueName');
        });

        it('should use a custom port in "local" mode', async () => {
          delete process.env.LAMBDA_WRAPPER_OFFLINE_SQS_HOST;
          process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE = 'local';
          process.env.LAMBDA_WRAPPER_OFFLINE_SQS_PORT = '4566';
          const service = getService({}, true);

          await service.publish(TEST_QUEUE, { test: 1 });

          const params = service.sqs.sendMessage.mock.calls[0][0];
          expect(params.QueueUrl).toEqual('http://localhost:4566/queue/QueueName');
        });

        it('should use a correctly formed AWS queue URL in "aws" mode', async () => {
          // `AWS_ACCOUNT_ID` and `REGION` need to be set for this to work
          process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE = 'aws';
          process.env.AWS_ACCOUNT_ID = '0123456789';
          process.env.REGION = 'eu-west-1';
          const service = getService({}, true);

          await service.publish(TEST_QUEUE, { test: 1 });

          const params = service.sqs.sendMessage.mock.calls[0][0];
          expect(params.QueueUrl).toEqual('https://sqs.eu-west-1.amazonaws.com/0123456789/QueueName');
        });
      });
    });

    describe('failure modes', () => {
      it(`catches the error if publish fails with failureMode === ${SQS_PUBLISH_FAILURE_MODES.CATCH}`, async () => {
        const service = getService({
          sendMessage: new Error('SQS is down!'),
        }, false);

        const promise = service.publish(TEST_QUEUE, { test: 1 }, null, SQS_PUBLISH_FAILURE_MODES.CATCH);

        await expect(promise).resolves.toEqual(null);
      });

      it('catches the error if publish fails with failureMode omitted', async () => {
        const service = getService({
          sendMessage: new Error('SQS is down!'),
        }, false);

        const promise = service.publish(TEST_QUEUE, { test: 1 }, null);

        await expect(promise).resolves.toEqual(null);
      });

      it(`throws an error if publish fails with failureMode === ${SQS_PUBLISH_FAILURE_MODES.THROW}`, async () => {
        const service = getService({
          sendMessage: new Error('SQS is down!'),
        }, false);

        const promise = service.publish(TEST_QUEUE, { test: 1 }, null, SQS_PUBLISH_FAILURE_MODES.THROW);

        await expect(promise).rejects.toThrowError('SQS is down!');
      });

      [
        '',
        null,
        'another-value',
      ].forEach((invalidValue) => {
        it(`throws an error with the invalid value: ${invalidValue}`, async () => {
          const service = getService();

          const promise = service.publish(TEST_QUEUE, { test: 1 }, null, invalidValue);

          await expect(promise).rejects.toThrowErrorMatchingSnapshot();
        });
      });
    });
  });
});
