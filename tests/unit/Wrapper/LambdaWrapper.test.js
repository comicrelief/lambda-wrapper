import sinon from 'sinon';

import { DEFINITIONS } from '../../../src/Config/Dependencies';
import RequestService, { REQUEST_TYPES } from '../../../src/Service/Request.service';
import DependencyInjection from '../../../src/DependencyInjection/DependencyInjection.class';
import LambdaWrapper, { handleError } from '../../../src/Wrapper/LambdaWrapper';
import LambdaTermination from '../../../src/Wrapper/LambdaTermination';
import { getMockedDi } from '../../lib/mocks';

const getEvent = require('../../mocks/aws/event.json');
const getContext = require('../../mocks/aws/context.json');

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
    sinon.stub(console._stdout, 'write');
  });

  afterEach(() => sinon.restore());

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

    describe('Axios Errors', () => {
      it('Trims down the axios error', () => {
        const di = getMockedDi();
        const logger = di.get(DEFINITIONS.LOGGER);

        const error = {
          isAxiosError: true,
          raiseOnEpsagon: true,
          config: {
            url: 'http://localhost:9999',
            method: 'get',
          },
          extra: 1,
          response: {
            status: 417,
            data: { data: 1 },
            extra: 2,
          }
        };

        const response = handleError(di, error);

        const loggerCall = logger.error.mock.calls[0][0];

        expect(loggerCall).toMatchSnapshot();
        expect('extra' in loggerCall).toEqual(false);
        expect('extra' in loggerCall.response).toEqual(false);
      });

      it('Handles an invalid axios error', () => {
        const di = getMockedDi();
        const logger = di.get(DEFINITIONS.LOGGER);

        const error = {
          isAxiosError: true,
          raiseOnEpsagon: true,
          extra: 1,
        };

        const response = handleError(di, error);

        const loggerCall = logger.error.mock.calls[0][0];

        expect(loggerCall).toEqual(error);
      });
    });

  });

  describe('LambdaWrapper', () => {
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

        const lambda = LambdaWrapper(configuration, (di) => {
          infoStub = sinon.stub(di.dependencies[DEFINITIONS.LOGGER], 'info');
          errorStub = sinon.stub(di.dependencies[DEFINITIONS.LOGGER], 'error');
          throw new Error('Undefined error');
        });

        lambda(getEvent, getContext);

        expect(infoStub.called).toEqual(false);
        expect(errorStub.called).toEqual(true);
      });

      [400, 401, 403, 404, 409, 419, 421, 423, 499].forEach((errorCode) => {
        it(`Logs.info the error with code ${errorCode}`, () => {
          let infoStub;
          let errorStub;

          const lambda = LambdaWrapper(configuration, (di) => {
            infoStub = sinon.stub(di.dependencies[DEFINITIONS.LOGGER], 'info');
            errorStub = sinon.stub(di.dependencies[DEFINITIONS.LOGGER], 'error');
            const error = new Error('4xx error');
            error.code = errorCode;
            throw error;
          });

          lambda(getEvent, getContext);

          expect(infoStub.called).toEqual(true);
          expect(errorStub.called).toEqual(false);
        });
      });

      [500, 501, 502, 503].forEach((errorCode) => {
        it(`Logs.error the error with code ${errorCode}`, () => {
          let infoStub;
          let errorStub;

          const lambda = LambdaWrapper(configuration, (di) => {
            infoStub = sinon.stub(di.dependencies[DEFINITIONS.LOGGER], 'info');
            errorStub = sinon.stub(di.dependencies[DEFINITIONS.LOGGER], 'error');
            const error = new Error('5xx error');
            error.code = errorCode;
            throw error;
          });

          lambda(getEvent, getContext);

          expect(infoStub.called).toEqual(false);
          expect(errorStub.called).toEqual(true);
        });
      });

      it('Returns 500 exception with a common error', () => {
        const lambda = LambdaWrapper(configuration, (di) => {
          sinon.stub(di.dependencies[DEFINITIONS.LOGGER], 'error');
          throw new Error('Some error');
        });

        const response = lambda(getEvent, getContext);
        const body = JSON.parse(response.body);

        expect(response.statusCode).toEqual(500);
        expect(body.message).toEqual('unknown error');
      });

      it('Returns a response generated by LambdaTermination', () => {
        const lambda = LambdaWrapper(configuration, (di) => {
          sinon.stub(di.dependencies[DEFINITIONS.LOGGER], 'error');
          throw new LambdaTermination('internal', 403, 'external', 'some message');
        });

        const response = lambda(getEvent, getContext);
        const body = JSON.parse(response.body);

        expect(response.statusCode).toEqual(403);
        expect(body.data).toEqual('external');
        expect(body.message).toEqual('some message');
      });

      it('Catches async errors', () => {
        const lambda = LambdaWrapper(configuration, (di) => new Promise(() => {
          sinon.stub(di.dependencies[DEFINITIONS.LOGGER], 'error');
          throw new LambdaTermination('internal', 403, 'external');
        }));

        return lambda(getEvent, getContext).then((response) => {
          const body = JSON.parse(response.body);

          expect(response.statusCode).toEqual(403);
          expect(body.message).toEqual('unknown error');
          expect(body.data).toEqual('external');
        });
      });
    });
  });
});
