import Winston from 'winston';

import {
  Context,
  DependencyInjection,
  LoggerService,
} from '@/src';
import mockEvent from '@/tests/mocks/aws/event.json';

const mockContext = { invokedFunctionArn: 'my-function' } as Context;

const getLogger = (event = mockEvent, context = mockContext) => {
  const di = new DependencyInjection({ dependencies: { LoggerService } }, event, context);
  return new LoggerService(di);
};

describe('unit.services.LoggerService', () => {
  const context = { invokedFunctionArn: 'my-function' } as Context;

  const axiosResponses = {
    UNDEFINED: undefined,
    EMPTY: {},
    HTTP_417: {
      status: 417,
      data: { data: 1 },
      extra: 2,
    },
  };

  afterEach(() => jest.clearAllMocks());

  describe('logger', () => {
    it('should return a logger', () => {
      const logger = getLogger(undefined, context);
      expect(logger.logger.constructor.name).toEqual('DerivedLogger');
    });

    it('should not call `Winston.createLogger` twice', () => {
      const winston = Symbol('winston') as unknown as Winston.Logger;
      const logger = getLogger(undefined, context);

      jest.spyOn(Winston, 'createLogger').mockImplementation(() => winston);

      // use the getter several times
      expect(logger.logger).toEqual(winston);
      expect(logger.logger).toEqual(winston);
      expect(logger.logger).toEqual(winston);

      expect(Winston.createLogger).toHaveBeenCalledTimes(1);
    });
  });

  describe('error', () => {
    Object.entries(axiosResponses).forEach(([key, axiosResponse]) => {
      it(`Trims down the axios error: ${key}`, () => {
        const logger = getLogger();
        const log = jest.fn();
        const fakeLogger = { log } as unknown as Winston.Logger;

        jest.spyOn(logger, 'logger', 'get').mockReturnValue(fakeLogger);

        const error = {
          isAxiosError: true,
          raiseOnEpsagon: true,
          config: {
            url: 'http://localhost:9999',
            method: 'get',
          },
          extra: 1,
          response: axiosResponse,
          message: 'some-message',
        };

        logger.error(error);

        const loggerCall = log.mock.calls[0][2].error;

        expect(loggerCall).toMatchSnapshot();
        expect('extra' in loggerCall).toEqual(false);

        if (axiosResponse) {
          expect('extra' in loggerCall.response).toEqual(false);
        }
      });
    });
  });

  describe('info', () => {
    Object.entries(axiosResponses).forEach(([key, axiosResponse]) => {
      it(`Trims down the axios error: ${key}`, () => {
        const logger = getLogger();
        const log = jest.fn();
        const fakeLogger = { log } as unknown as Winston.Logger;

        jest.spyOn(logger, 'logger', 'get').mockReturnValue(fakeLogger);

        const error = {
          isAxiosError: true,
          raiseOnEpsagon: true,
          config: {
            url: 'http://localhost:9999',
            method: 'get',
          },
          extra: 1,
          response: axiosResponse,
          message: 'some-message',
        };

        logger.info(error);

        const loggerCall = log.mock.calls[0][1];

        expect(loggerCall).toMatchSnapshot();
        expect('extra' in loggerCall).toEqual(false);

        if (axiosResponse) {
          expect('extra' in loggerCall.response).toEqual(false);
        }
      });
    });
  });

  describe('warning', () => {
    let LOGGER_SOFT_WARNING: string | undefined;

    beforeAll(() => {
      LOGGER_SOFT_WARNING = process.env.LOGGER_SOFT_WARNING;
    });

    afterAll(() => {
      process.env.LOGGER_SOFT_WARNING = LOGGER_SOFT_WARNING;
    });

    ([
      ['', 'error'],
      ['some-value', 'error'],
      ['false', 'error'],
      ['0', 'error'],
      ['1', 'info'],
      ['true', 'info'],
    ] as [string, 'error' | 'info'][]).forEach(([loggerSoftWarning, func]) => {
      it(`uses 'this.logger.${func}' in ${loggerSoftWarning}`, () => {
        process.env.LOGGER_SOFT_WARNING = loggerSoftWarning;
        const logger = getLogger();

        jest.spyOn(logger, func).mockImplementation(() => { /* no-op */ });

        logger.warning({});

        expect(logger[func]).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('object', () => {
    ([
      'error',
      'warning',
      'info',
    ] as const).forEach((level) => {
      [
        null,
        'a string',
        { a: 1 },
        { a: { b: null }, c: 'a string' },
      ].forEach((object) => {
        it(`Logs a '${JSON.stringify(object)}' with level: '${level}'`, () => {
          const logger = getLogger();
          let calledArgs: any[] = [];
          const fakeLog = (...args: any[]) => { calledArgs = args; };

          jest.spyOn(logger, level).mockImplementation(fakeLog);

          logger.object('My action', object, level);

          expect(logger[level]).toHaveBeenCalledTimes(1);
          expect(calledArgs[0]).toMatchSnapshot();
        });
      });
    });
  });
});
