import {
  InvokeCommand,
  LambdaClient,
} from '@aws-sdk/client-lambda';
import {
  ListQueuesCommand,
  SQSClient,
  SendMessageCommand,
} from '@aws-sdk/client-sqs';

import {
  Context,
  DependencyInjection,
  LoggerService,
  SQSService,
  SQS_PUBLISH_FAILURE_MODES,
  TimerService,
} from '@/src';

const TEST_QUEUE = 'TEST_QUEUE';

const config = {
  dependencies: {
    SQSService,
    LoggerService,
    TimerService,
  },
  sqs: {
    queues: {
      [TEST_QUEUE]: 'QueueName',
    },
    queueConsumers: {
      [TEST_QUEUE]: 'ConsumerFunctionName',
    },
  },
};

type MockSQSService = SQSService<typeof config> & {
  sqs: {
    send: jest.Mock;
  };
  lambda: {
    send: jest.Mock;
  }
};

/**
 * Generates a SQSService
 *
 * @param param0
 * @param isOffline
 */
const getService = (
  {
    listQueues = null,
    sendMessage = null,
    invoke = null,
  }: any = {},
  isOffline = false,
): MockSQSService => {
  const di = new DependencyInjection(config, {}, {
    invokedFunctionArn: isOffline ? 'offline' : 'arn:aws:lambda:eu-west-1:0123456789:test',
  } as Context);

  const logger = di.get(LoggerService);
  jest.spyOn(logger, 'error').mockImplementation();

  const service = di.get(SQSService);

  const sqs = {
    send: jest.fn().mockImplementation((command) => {
      let result;
      if (command instanceof ListQueuesCommand) {
        result = listQueues;
      } else if (command instanceof SendMessageCommand) {
        result = sendMessage;
      } else {
        throw new Error(`Unmocked SQS command: ${command.prototype.constructor.name}`);
      }
      return result instanceof Error
        ? Promise.reject(result)
        : Promise.resolve(result);
    }),
  } as unknown as SQSClient;

  const lambda = {
    send: jest.fn().mockImplementation((command) => {
      let result;
      if (command instanceof InvokeCommand) {
        result = invoke;
      } else {
        throw new Error(`Unmocked Lambda command: ${command.prototype.constructor.name}`);
      }
      return result instanceof Error
        ? Promise.reject(result)
        : Promise.resolve(result);
    }),
  } as unknown as LambdaClient;

  jest.spyOn(service, 'sqs', 'get').mockReturnValue(sqs);
  jest.spyOn(service, 'lambda', 'get').mockReturnValue(lambda);

  return service as any;
};

describe('unit.services.SQSService', () => {
  let envAccountId: string | undefined;
  let envOfflineSqsMode: string | undefined;
  let envOfflineSqsHost: string | undefined;
  let envOfflineSqsPort: string | undefined;
  let envRegion: string | undefined;

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

  it('should load config from the `sqs` key', () => {
    const di = new DependencyInjection(config, {}, {} as Context);
    const sqs = di.get(SQSService);

    expect(sqs.queues).toEqual(config.sqs?.queues);
    expect(sqs.queueConsumers).toEqual(config.sqs?.queueConsumers);
  });

  describe('checkStatus', () => {
    describe('when SQS is available', () => {
      it('should return status "OK"', async () => {
        const service = getService({
          listQueues: {
            QueueUrls: [config.sqs.queues[TEST_QUEUE]],
          },
        }, false);

        const result = await service.checkStatus();
        expect(result).toEqual({
          service: 'SQS',
          status: 'OK',
        });
      });
    });

    describe('when SQS is unavailable', () => {
      it('should return status "APPLICATION_FAILURE"', async () => {
        const service = getService({
          listQueues: new Error('service unavailable'),
        }, false);

        const result = await service.checkStatus();
        expect(result).toEqual({
          service: 'SQS',
          status: 'APPLICATION_FAILURE',
        });
      });
    });

    describe('when `listQueues` returns no queues', () => {
      it('should return status "APPLICATION_FAILURE"', async () => {
        const service = getService({
          listQueues: {
            QueueUrls: [],
          },
        }, false);

        const result = await service.checkStatus();
        expect(result).toEqual({
          service: 'SQS',
          status: 'APPLICATION_FAILURE',
        });
      });
    });
  });

  describe('publish', () => {
    describe('when container.isOffline === false', () => {
      ([
        ['sends to SQS', undefined],
        ['sends to SQS, even in "direct" offline mode', 'direct'],
        ['sends to SQS, even in "local" offline mode', 'local'],
        ['sends to SQS, even in "aws" offline mode', 'aws'],
        ['sends to SQS, even in "invalid" offline mode', 'invalid'],
      ] as const).forEach(([description, offlineMode]) => {
        it(description, async () => {
          process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE = offlineMode;
          const service = getService({}, false);

          await service.publish(TEST_QUEUE, { test: 1 });

          expect(service.sqs.send).toHaveBeenCalledTimes(1);
          expect(service.sqs.send).toHaveBeenCalledWith(expect.any(SendMessageCommand));
          expect(service.lambda.send).not.toHaveBeenCalled();

          const command = service.sqs.send.mock.calls[0][0];
          expect(command.input.QueueUrl).not.toContain('localhost');
        });
      });
    });

    describe('when container.isOffline === true', () => {
      it('sends a lambda request by default', async () => {
        delete process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE;
        const service = getService({}, true);

        await service.publish(TEST_QUEUE, { test: 1 });

        expect(service.sqs.send).not.toHaveBeenCalled();
        expect(service.lambda.send).toHaveBeenCalledTimes(1);
        expect(service.lambda.send).toHaveBeenCalledWith(expect.any(InvokeCommand));
      });

      it('sends a lambda request in "direct" mode', async () => {
        process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE = 'direct';
        const service = getService({}, true);

        await service.publish(TEST_QUEUE, { test: 1 });

        expect(service.sqs.send).not.toHaveBeenCalled();
        expect(service.lambda.send).toHaveBeenCalledTimes(1);

        const command: InvokeCommand = service.lambda.send.mock.calls[0][0];
        expect(command).toBeInstanceOf(InvokeCommand);
        expect(command.input.FunctionName).toEqual('ConsumerFunctionName');
      });

      it('sends a local SQS request in "local" mode', async () => {
        delete process.env.LAMBDA_WRAPPER_OFFLINE_SQS_HOST;
        delete process.env.LAMBDA_WRAPPER_OFFLINE_SQS_PORT;
        process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE = 'local';
        const service = getService({}, true);

        await service.publish(TEST_QUEUE, { test: 1 });

        expect(service.sqs.send).toHaveBeenCalledTimes(1);
        expect(service.sqs.send).toHaveBeenCalledWith(expect.any(SendMessageCommand));
        expect(service.lambda.send).not.toHaveBeenCalled();

        const command = service.sqs.send.mock.calls[0][0];
        expect(command.input.QueueUrl).toContain('localhost');
        expect(command.input.QueueUrl).toContain('4576');
      });

      it('sends a normal SQS request in "aws" mode', async () => {
        process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE = 'aws';
        const service = getService({}, true);

        await service.publish(TEST_QUEUE, { test: 1 });

        expect(service.sqs.send).toHaveBeenCalledTimes(1);
        expect(service.sqs.send).toHaveBeenCalledWith(expect.any(SendMessageCommand));
        expect(service.lambda.send).not.toHaveBeenCalled();

        const command = service.sqs.send.mock.calls[0][0];
        expect(command.input.QueueUrl).not.toContain('localhost');
        expect(command.input.QueueUrl).not.toContain('4576');
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

          const command = service.sqs.send.mock.calls[0][0];
          expect(command.input.QueueUrl).toEqual('https://sqs.eu-west-1.amazonaws.com/0123456789/QueueName');
        });
      });

      describe('when container.isOffline === true', () => {
        it('should use a LocalStack URL in "local" mode', async () => {
          delete process.env.LAMBDA_WRAPPER_OFFLINE_SQS_HOST;
          delete process.env.LAMBDA_WRAPPER_OFFLINE_SQS_PORT;
          process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE = 'local';
          const service = getService({}, true);

          await service.publish(TEST_QUEUE, { test: 1 });

          const command = service.sqs.send.mock.calls[0][0];
          expect(command.input.QueueUrl).toEqual('http://localhost:4576/queue/QueueName');
        });

        it('should use a custom host in "local" mode', async () => {
          delete process.env.LAMBDA_WRAPPER_OFFLINE_SQS_PORT;
          process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE = 'local';
          process.env.LAMBDA_WRAPPER_OFFLINE_SQS_HOST = 'custom-host';
          const service = getService({}, true);

          await service.publish(TEST_QUEUE, { test: 1 });

          const command = service.sqs.send.mock.calls[0][0];
          expect(command.input.QueueUrl).toEqual('http://custom-host:4576/queue/QueueName');
        });

        it('should use a custom port in "local" mode', async () => {
          delete process.env.LAMBDA_WRAPPER_OFFLINE_SQS_HOST;
          process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE = 'local';
          process.env.LAMBDA_WRAPPER_OFFLINE_SQS_PORT = '4566';
          const service = getService({}, true);

          await service.publish(TEST_QUEUE, { test: 1 });

          const command = service.sqs.send.mock.calls[0][0];
          expect(command.input.QueueUrl).toEqual('http://localhost:4566/queue/QueueName');
        });

        it('should use a correctly formed AWS queue URL in "aws" mode', async () => {
          // `AWS_ACCOUNT_ID` and `REGION` need to be set for this to work
          process.env.LAMBDA_WRAPPER_OFFLINE_SQS_MODE = 'aws';
          process.env.AWS_ACCOUNT_ID = '0123456789';
          process.env.REGION = 'eu-west-1';
          const service = getService({}, true);

          await service.publish(TEST_QUEUE, { test: 1 });

          const command = service.sqs.send.mock.calls[0][0];
          expect(command.input.QueueUrl).toEqual('https://sqs.eu-west-1.amazonaws.com/0123456789/QueueName');
        });
      });
    });

    describe('failure modes', () => {
      it('throws the error if publish fails with failureMode omitted', async () => {
        const service = getService({
          sendMessage: new Error('SQS is down!'),
        }, false);

        const promise = service.publish(TEST_QUEUE, { test: 1 }, undefined);

        await expect(promise).rejects.toThrowError('SQS is down!');
      });

      it(`catches the error if publish fails with failureMode === ${SQS_PUBLISH_FAILURE_MODES.CATCH}`, async () => {
        const service = getService({
          sendMessage: new Error('SQS is down!'),
        }, false);

        const promise = service.publish(TEST_QUEUE, { test: 1 }, undefined, SQS_PUBLISH_FAILURE_MODES.CATCH);

        await expect(promise).resolves.toEqual(null);
      });

      it(`throws an error if publish fails with failureMode === ${SQS_PUBLISH_FAILURE_MODES.THROW}`, async () => {
        const service = getService({
          sendMessage: new Error('SQS is down!'),
        }, false);

        const promise = service.publish(TEST_QUEUE, { test: 1 }, undefined, SQS_PUBLISH_FAILURE_MODES.THROW);

        await expect(promise).rejects.toThrowError('SQS is down!');
      });

      [
        '',
        null,
        'another-value',
      ].forEach((invalidValue: any) => {
        it(`throws an error with the invalid value: ${invalidValue}`, async () => {
          const service = getService();

          const promise = service.publish(TEST_QUEUE, { test: 1 }, undefined, invalidValue);

          await expect(promise).rejects.toThrowErrorMatchingSnapshot();
        });
      });
    });
  });
});
