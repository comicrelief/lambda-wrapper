import Winston from 'winston';

import DependencyInjection from '../../../src/DependencyInjection/DependencyInjection.class';
import LoggerService from '../../../src/Service/Logger.service';
import CONFIGURATION from '../../../src/Config/Dependencies';

const getEvent = require('../../mocks/aws/event.json');

const getContext = { invokedFunctionArn: 'my-function' };

const getLogger = (event = getEvent, context = getContext) => new LoggerService(new DependencyInjection(CONFIGURATION, event, context));

describe('Service/LoggerService', () => {
  const context = { invokedFunctionArn: 'my-function' };

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

  describe('constructor', () => {
    it('Creates a LoggerService instance', () => {
      expect(getLogger()).toBeInstanceOf(LoggerService);
    });
  });

  describe('getLogger', () => {
    it('Creates a logger instance', () => {
      const logger = getLogger(undefined, context);
      const winston = logger.getLogger();
      expect(winston.constructor.name).toEqual('DerivedLogger');
    });
  });

  describe('logger', () => {
    it('Starts as null', () => {
      const logger = getLogger(undefined, context);
      expect(logger.winston).toEqual(null);
    });

    it('Fetches a logger', () => {
      const winston = Symbol('winston');
      const logger = getLogger(undefined, context);
      jest.spyOn(Winston, 'createLogger').mockImplementation(() => winston);

      expect(logger.logger).toEqual(winston);
    });

    it("Doesn' call Winston.createLogger twice", () => {
      const winston = Symbol('winston');
      const logger = getLogger(undefined, context);
      jest.spyOn(Winston, 'createLogger').mockImplementation(() => winston);

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

        jest.spyOn(logger, 'logger', 'get').mockReturnValue({ log });

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

        jest.spyOn(logger, 'logger', 'get').mockReturnValue({ log });

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
    let LOGGER_SOFT_WARNING;

    beforeAll(() => {
      LOGGER_SOFT_WARNING = process.env.LOGGER_SOFT_WARNING;
    });

    afterAll(() => {
      process.env.LOGGER_SOFT_WARNING = LOGGER_SOFT_WARNING;
    });

    [
      ['', 'error'],
      ['some-value', 'error'],
      [false, 'error'],
      ['false', 'error'],
      ['0', 'error'],
      ['1', 'info'],
      [true, 'info'],
      ['true', 'info'],
    ].forEach(([loggerSoftWarning, func]) => {
      it(`uses 'this.logger.${func}' in ${loggerSoftWarning}`, () => {
        process.env.LOGGER_SOFT_WARNING = loggerSoftWarning;
        const logger = getLogger();

        jest.spyOn(logger, func).mockImplementation(() => {});

        logger.warning({});

        expect(logger[func]).toHaveBeenCalledTimes(1);
      });
    });
  });
});
