import Winston from 'winston';

import DependencyInjection from '../../../src/DependencyInjection/DependencyInjection.class';
import LoggerService from '../../../src/Service/Logger.service';
import CONFIGURATION from '../../../src/Config/Dependencies';

const getEvent = require('../../mocks/aws/event.json');

const getContext = { invokedFunctionArn: 'my-function' };

const getLogger = (event = getEvent, context = getContext) => {
  return new LoggerService(new DependencyInjection(CONFIGURATION, event, context));
};

describe('Service/LoggerService', () => {
  const context = { invokedFunctionArn: 'my-function' };

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
});
