import { RESPONSE_HEADERS } from '@/src/models/ResponseModel';

import {
  DependencyInjection,
  LambdaTermination,
  LambdaWrapper,
  LambdaWrapperConfig,
  LoggerService,
  RequestService,
} from '@/src';
import { mockContext, mockEvent } from '@/tests/mocks/aws';

type ErrorWithCode = Error & { code?: number };

const config: LambdaWrapperConfig = {
  dependencies: {
    LoggerService,
    RequestService,
  },
};

const getDi = () => new DependencyInjection(config, mockEvent, mockContext);

describe('unit.core.LambdaWrapper', () => {
  beforeAll(() => {
    // mute log ouptut
    const noop = () => { /* do nothing */ };
    jest.spyOn(LoggerService.prototype, 'info').mockImplementation(noop);
    jest.spyOn(LoggerService.prototype, 'error').mockImplementation(noop);
    jest.spyOn(LoggerService.prototype, 'metric').mockImplementation(noop);
    jest.spyOn(LoggerService.prototype, 'label').mockImplementation(noop);
  });

  afterEach(() => jest.resetAllMocks());

  describe('configure', () => {
    // see tests/unit/core/config.spec.ts for config merge tests

    const base = new LambdaWrapper({
      dependencies: {},
    });

    const configured = base.configure({
      dependencies: {
        LoggerService,
      },
    });

    it('should return a LambdaWrapper with the given config', () => {
      expect(configured).toBeInstanceOf(LambdaWrapper);
      expect(configured.config).toEqual({
        dependencies: {
          LoggerService,
        },
      });
    });

    it('should not modify the original wrapper config', () => {
      expect(base.config).toEqual({
        dependencies: {},
      });
    });
  });

  describe('wrap', () => {
    const lambdaWrapper = new LambdaWrapper(config);

    it('should return a wrapped handler function', async () => {
      const wrapped = lambdaWrapper.wrap(jest.fn());

      expect(typeof wrapped).toEqual('function');
    });

    describe('the wrapped handler', () => {
      it('should call the handler', async () => {
        const fn = jest.fn();
        const wrapped = lambdaWrapper.wrap(fn);

        await wrapped(mockEvent, mockContext);

        expect(fn).toHaveBeenCalled();
      });

      it('should forward the return value', async () => {
        const result = Math.random();
        const fn = jest.fn().mockResolvedValue(result);
        const wrapped = lambdaWrapper.wrap(fn);

        expect(await wrapped(mockEvent, mockContext)).toEqual(result);
      });

      it('should pass dependency injection to the handler', async () => {
        const fn = jest.fn();
        const wrapped = lambdaWrapper.wrap(fn);

        await wrapped(mockEvent, mockContext);

        const callArgs: any[] = fn.mock.calls[0];
        expect(callArgs).toHaveLength(1);
        expect(callArgs[0]).toBeInstanceOf(DependencyInjection);
      });

      it('should provide the Lambda event via di', async () => {
        const fn = jest.fn();
        const wrapped = lambdaWrapper.wrap(fn);

        await wrapped(mockEvent, mockContext);

        const [di]: [DependencyInjection] = fn.mock.calls[0];
        expect(di.event).toEqual(mockEvent);
      });

      it('should provide the Lambda context via di', async () => {
        const fn = jest.fn();
        const wrapped = lambdaWrapper.wrap(fn);

        await wrapped(mockEvent, mockContext);

        const [di]: [DependencyInjection] = fn.mock.calls[0];
        expect(di.context).toEqual(mockContext);
      });
    });

    describe('handleUncaughtErrors = true (default)', () => {
      describe('when error has no code property', () => {
        it('should pass it to logger.error', async () => {
          let logger: LoggerService;

          const lambda = lambdaWrapper.wrap((di) => {
            logger = di.get(LoggerService);
            throw new Error('Undefined error');
          });

          await lambda(mockEvent, mockContext);

          expect(logger!.info).not.toHaveBeenCalled();
          expect(logger!.error).toHaveBeenCalled();
          expect(logger!.metric).lastCalledWith('lambda.statusCode', 500);
        });
      });

      describe('when error has code 4xx', () => {
        [400, 401, 403, 404, 409, 419, 421, 423, 499].forEach((errorCode) => {
          it(`should call logger.info with code ${errorCode}`, async () => {
            let logger: LoggerService;

            const lambda = lambdaWrapper.wrap((di) => {
              logger = di.get(LoggerService);

              const error: ErrorWithCode = new Error('4xx error');
              error.code = errorCode;
              throw error;
            });

            await lambda(mockEvent, mockContext);

            expect(logger!.info).toHaveBeenCalled();
            expect(logger!.error).not.toHaveBeenCalled();
            expect(logger!.metric).lastCalledWith('lambda.statusCode', errorCode);
          });
        });
      });

      describe('when error has code 5xx', () => {
        [500, 501, 502, 503].forEach((errorCode) => {
          it(`should call logger.error with code ${errorCode}`, async () => {
            let logger: LoggerService;

            const lambda = lambdaWrapper.wrap((di) => {
              logger = di.get(LoggerService);

              const error: ErrorWithCode = new Error('5xx error');
              error.code = errorCode;
              throw error;
            });

            await lambda(mockEvent, mockContext);

            expect(logger!.info).not.toHaveBeenCalled();
            expect(logger!.error).toHaveBeenCalled();
            expect(logger!.metric).lastCalledWith('lambda.statusCode', errorCode);
          });
        });
      });

      describe('handler return value', () => {
        describe('when a standard Error is thrown', () => {
          it('should return status code 500 and message "unknown error"', async () => {
            const lambda = lambdaWrapper.wrap(() => {
              throw new Error('Some error');
            });

            const response = await lambda(mockEvent, mockContext);

            expect(response.statusCode).toEqual(500);
            expect(JSON.parse(response.body)).toHaveProperty('message', 'unknown error');
          });
        });

        describe('when a LambdaTermination is thrown', () => {
          it('should return status code 403', async () => {
            const lambda = lambdaWrapper.wrap(() => {
              throw new LambdaTermination('internal', 403, 'external', 'some message');
            });

            const response = await lambda(mockEvent, mockContext);

            expect(response.statusCode).toEqual(403);
            const body = JSON.parse(response.body);
            expect(body).toHaveProperty('data', 'external');
            expect(body).toHaveProperty('message', 'some message');
          });
        });
      });
    });

    describe('handleUncaughtErrors = false', () => {
      describe('synchronous error', () => {
        it('should return a promise that eventually rejects', async () => {
          // note: handler function IS NOT async
          const lambda = lambdaWrapper.wrap(() => {
            throw new LambdaTermination('sync error message', 403, 'external');
          }, {
            handleUncaughtErrors: false,
          });

          const promise = lambda(mockEvent, mockContext);

          // be absolutely sure we got a rejection or the lambda will not count as failed
          await expect(promise).rejects.toThrowError(LambdaTermination);
        });
      });

      describe('asynchronous error', () => {
        it('should return a promise that eventually rejects', async () => {
          // note: handler function IS async
          const lambda = lambdaWrapper.wrap(async () => {
            throw new LambdaTermination('async error message', 403, 'external');
          }, {
            handleUncaughtErrors: false,
          });

          const promise = lambda(mockEvent, mockContext);

          // be absolutely sure we got a rejection or the lambda will not count as failed
          await expect(promise).rejects.toThrowError(LambdaTermination);
        });
      });
    });
  });

  describe('handleError', () => {
    ([
      [undefined, 400, 0],
      [false, 400, 0],
      [true, 400, 1],
      [undefined, undefined, 1],
      [undefined, false, 1],
      [undefined, 500, 1],
      [true, 500, 1],
    ] as const).forEach(([raiseOnEpsagon, code, expected]) => {
      it(`should ${expected === 0 ? 'not ' : ''}call logger.error given { raiseOnEpsagon: ${raiseOnEpsagon}, code: ${code} }`, () => {
        const di = getDi();
        const logger = di.get(LoggerService);
        jest.spyOn(logger, 'error');

        const error = {
          name: 'Error',
          message: 'error!',
          raiseOnEpsagon,
          code,
        };

        LambdaWrapper.handleError(di, error);

        expect(logger.error).toHaveBeenCalledTimes(expected);
      });

      it('should return an HTTP response object', () => {
        const di = getDi();
        const error = {
          name: 'Error',
          message: 'error!',
          raiseOnEpsagon,
          code,
          body: { key: 'value' },
        };

        const response = LambdaWrapper.handleError(di, error);

        expect(response).toEqual({
          statusCode: code || 500,
          body: JSON.stringify({ data: error.body, message: 'unknown error' }),
          headers: RESPONSE_HEADERS,
        });
      });
    });
  });
});
