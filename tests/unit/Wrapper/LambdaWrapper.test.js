/* eslint-disable sonarjs/no-duplicate-string */
import { DEFINITIONS } from '../../../src/Config/Dependencies';
import DependencyInjection from '../../../src/DependencyInjection/DependencyInjection.class';
import ResponseModel from '../../../src/Model/Response.model';
import RequestService, { REQUEST_TYPES } from '../../../src/Service/Request.service';
import LambdaTermination from '../../../src/Wrapper/LambdaTermination';
import LambdaWrapper, { handleError } from '../../../src/Wrapper/LambdaWrapper';
import { getMockedDi } from '../../lib/mocks';
import getContext from '../../mocks/aws/context.json';
import getEvent from '../../mocks/aws/event.json';

const handlers = {
  SYNC_SUCCESS: () => ResponseModel.generate({ x: 'success' }, 200, 'ok'),
  SYNC_THROWING: (di) => {
    jest.spyOn(di.dependencies[DEFINITIONS.LOGGER], 'error');
    jest.spyOn(di.dependencies[DEFINITIONS.LOGGER], 'metric');

    throw new LambdaTermination('SYNC_THROWING', 403, 'external');
  },
  ASYNC_SUCCESS: () => Promise.resolve(ResponseModel.generate({ x: 'success' }, 200, 'ok')),
  ASYNC_THROWING: (di) => new Promise(() => {
    jest.spyOn(di.dependencies[DEFINITIONS.LOGGER], 'error');
    jest.spyOn(di.dependencies[DEFINITIONS.LOGGER], 'metric');

    throw new LambdaTermination('ASYNC_THROWING', 403, 'external');
  }),
};

describe('Wrapper/LambdaWrapper', () => {
  let dependencyInjection = {};
  let requestService = {};

  const configuration = {
    DEFINITIONS: {},
    DEPENDENCIES: {},
  };

  beforeEach(() => {
    // Mute Winston
    // eslint-disable-next-line no-underscore-dangle
    jest.spyOn(console._stdout, 'write').mockImplementation(() => {});
  });

  afterEach(() => jest.resetAllMocks());

  describe('handleError', () => {
    [
      [undefined, 400, 0],
      [false, 400, 0],
      [true, 400, 1],
      [undefined, undefined, 1],
      [undefined, false, 1],
      [undefined, 500, 1],
      [true, 500, 1],
    ].forEach(([raiseOnEpsagon, code, expected]) => {
      it(`error.raiseOnEpsagon = '${raiseOnEpsagon}', code = '${code}' logger.error called ${expected} times`, () => {
        const di = getMockedDi();
        const logger = di.get(DEFINITIONS.LOGGER);
        const error = { raiseOnEpsagon, code };

        handleError(di, error);

        expect(logger.error).toHaveBeenCalledTimes(expected);
      });

      [undefined, { data: 1 }].forEach((body) => {
        it('Generates a response object', () => {
          const di = getMockedDi();
          const error = { raiseOnEpsagon, code, body };

          const response = handleError(di, error);

          expect(response).toMatchSnapshot();
        });
      });
    });
  });

  describe('LambdaWrapper', () => {
    describe('executes the wrapped function', () => {
      it('when it is sync', () => {
        const lambda = LambdaWrapper(configuration, handlers.SYNC_SUCCESS);
        expect(lambda(getEvent, getContext)).toMatchSnapshot();
      });

      it('when it is async', async () => {
        const lambda = LambdaWrapper(configuration, handlers.ASYNC_SUCCESS);
        await expect(lambda(getEvent, getContext)).resolves.toMatchSnapshot();
      });
    });

    describe('should inject dependency injection into the function', () => {
      LambdaWrapper(configuration, (di, request) => {
        dependencyInjection = di;
        requestService = request;
      })(getEvent, getContext);

      it('dependency injection variables should be an instance of the dependency injection class', () => {
        expect(dependencyInjection instanceof DependencyInjection).toEqual(true);
      });

      it('dependency injection should output the event that was provided to it', () => {
        expect(dependencyInjection.getEvent()).toEqual(getEvent);
      });

      it('dependency injection should output the event that was provided to it', () => {
        expect(dependencyInjection.getContext()).toEqual(getContext);
      });
    });

    describe('should inject the request service into the function', () => {
      LambdaWrapper(configuration, (di, request) => {
        dependencyInjection = di;
        requestService = request;
      })(getEvent, getContext);

      it('request service variables should be an instance of the dependency injection class', () => {
        expect(requestService instanceof RequestService).toEqual(true);
      });

      it('request service should contain variables that were sent to it via the event', () => {
        expect(requestService.get('test', null, REQUEST_TYPES.GET)).toEqual(getEvent.queryStringParameters.test);
      });
    });

    describe('should catch exceptions and generate appropriate responses', () => {
      it('Logs.error the error without error code', () => {
        let infoStub;
        let errorStub;
        let metricStub;

        const lambda = LambdaWrapper(configuration, (di) => {
          infoStub = jest.spyOn(di.dependencies[DEFINITIONS.LOGGER], 'info');
          errorStub = jest.spyOn(di.dependencies[DEFINITIONS.LOGGER], 'error');
          metricStub = jest.spyOn(di.dependencies[DEFINITIONS.LOGGER], 'metric');
          throw new Error('Undefined error');
        });

        lambda(getEvent, getContext);

        expect(infoStub).not.toHaveBeenCalled();
        expect(errorStub).toHaveBeenCalled();
        expect(metricStub).nthCalledWith(1, 'lambda.statusCode', 500);
      });

      [400, 401, 403, 404, 409, 419, 421, 423, 499].forEach((errorCode) => {
        it(`Logs.info the error with code ${errorCode}`, () => {
          let infoStub;
          let errorStub;
          let metricStub;

          const lambda = LambdaWrapper(configuration, (di) => {
            infoStub = jest.spyOn(di.dependencies[DEFINITIONS.LOGGER], 'info');
            errorStub = jest.spyOn(di.dependencies[DEFINITIONS.LOGGER], 'error');
            metricStub = jest.spyOn(di.dependencies[DEFINITIONS.LOGGER], 'metric');

            const error = new Error('4xx error');
            error.code = errorCode;
            throw error;
          });

          lambda(getEvent, getContext);

          expect(infoStub).toHaveBeenCalled();
          expect(errorStub).not.toHaveBeenCalled();
          expect(metricStub).nthCalledWith(1, 'lambda.statusCode', errorCode);
        });
      });

      [500, 501, 502, 503].forEach((errorCode) => {
        it(`Logs.error the error with code ${errorCode}`, () => {
          let infoStub;
          let errorStub;
          let metricStub;

          const lambda = LambdaWrapper(configuration, (di) => {
            infoStub = jest.spyOn(di.dependencies[DEFINITIONS.LOGGER], 'info');
            errorStub = jest.spyOn(di.dependencies[DEFINITIONS.LOGGER], 'error');
            metricStub = jest.spyOn(di.dependencies[DEFINITIONS.LOGGER], 'metric');

            const error = new Error('5xx error');
            error.code = errorCode;
            throw error;
          });

          lambda(getEvent, getContext);

          expect(infoStub).not.toHaveBeenCalled();
          expect(errorStub).toHaveBeenCalled();
          expect(metricStub).nthCalledWith(1, 'lambda.statusCode', errorCode);
        });
      });

      it('Returns 500 exception with a common error', () => {
        const lambda = LambdaWrapper(configuration, (di) => {
          jest.spyOn(di.dependencies[DEFINITIONS.LOGGER], 'error');
          jest.spyOn(di.dependencies[DEFINITIONS.LOGGER], 'metric');
          throw new Error('Some error');
        });

        const response = lambda(getEvent, getContext);
        const body = JSON.parse(response.body);

        expect(response.statusCode).toEqual(500);
        expect(body.message).toEqual('unknown error');
      });

      it('Returns a response generated by LambdaTermination', () => {
        const lambda = LambdaWrapper(configuration, (di) => {
          jest.spyOn(di.dependencies[DEFINITIONS.LOGGER], 'error');
          jest.spyOn(di.dependencies[DEFINITIONS.LOGGER], 'metric');
          throw new LambdaTermination('internal', 403, 'external', 'some message');
        });

        const response = lambda(getEvent, getContext);
        const body = JSON.parse(response.body);

        expect(response.statusCode).toEqual(403);
        expect(body.data).toEqual('external');
        expect(body.message).toEqual('some message');
      });

      describe('catches sync errors', () => {
        it('returns an error http response with throwError === false', () => {
          const lambda = LambdaWrapper(configuration, handlers.SYNC_THROWING, false);
          const outcome = lambda(getEvent, getContext);
          expect(outcome).toMatchSnapshot();
        });

        it('returns a raw error with throwError === true', () => {
          const lambda = LambdaWrapper(configuration, handlers.SYNC_THROWING, true);
          const outcome = lambda(getEvent, getContext);
          expect(outcome).toMatchSnapshot();

          // Be absolutely sure we got an Error object or the lambda will not count as failed
          expect(outcome instanceof LambdaTermination).toEqual(true);
          expect(outcome instanceof Error).toEqual(true);
        });
      });

      describe('catches async errors', () => {
        it('resolves an error http response with throwError === false', async () => {
          const lambda = LambdaWrapper(configuration, handlers.ASYNC_THROWING, false);
          await expect(lambda(getEvent, getContext)).resolves.toMatchSnapshot();
        });

        it('rejects the promise with throwError === true', async () => {
          const lambda = LambdaWrapper(configuration, handlers.ASYNC_THROWING, true);

          // Be absolutely sure we got a rejection or the lambda will not count as failed
          await expect(lambda(getEvent, getContext)).rejects.toThrowErrorMatchingSnapshot();
        });
      });
    });
  });
});
