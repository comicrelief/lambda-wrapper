import DependencyInjection from '../../../src/DependencyInjection/DependencyInjection.class';
import { DEFINITIONS } from '../../../src/Config/Dependencies';

import RequestService from '../../../src/Service/Request.service';
import LoggerService from '../../../src/Service/Logger.service';

const getEvent = require('../../mocks/aws/event.json');
const getContext = require('../../mocks/aws/context.json');

describe('DependencyInjection/DependencyInjectionClass', () => {
  describe('should instantiate', () => {
    const configuration = {
      test: 123,
    };
    const dependencyInjection = new DependencyInjection(configuration, getEvent, getContext);

    it('should output the event that was provided to it', () => {
      expect(dependencyInjection.getEvent()).toEqual(getEvent);
    });

    it('should output the context that was provided to it', () => {
      expect(dependencyInjection.getContext()).toEqual(getContext);
    });

    it('should output the configuration that was provided to it', () => {
      expect(dependencyInjection.getConfiguration()).toEqual(configuration);
    });
  });

  describe('should get dependencies', () => {
    const dependencyInjection = new DependencyInjection({}, getEvent, getContext);

    it('Should throw validation errors when an non existent model is requested', () => {
      expect(() => dependencyInjection.get('test')).toThrow('test does not exist in di container');
    });

    it('should fetch an instance of the logger service', () => {
      expect(dependencyInjection.get(DEFINITIONS.LOGGER) instanceof LoggerService).toEqual(true);
    });

    it('should fetch an instance of the request service', () => {
      const requestService = dependencyInjection.get(DEFINITIONS.REQUEST);
      expect(requestService instanceof RequestService).toEqual(true);
      expect(requestService.di instanceof DependencyInjection).toEqual(true);
    });
  });

  describe('isOffline', () => {
    afterEach(() => {
      process.env.USE_SERVERLESS_OFFLINE = '';
    });

    describe('is true', () => {
      it("when context doesn't define an invokedFunctionArn", () => {
        const di = new DependencyInjection({}, getEvent, {});
        expect(di.isOffline).toEqual(true);
      });

      it('When the invokedFunctionArn includes `offline`', () => {
        const di = new DependencyInjection({}, getEvent, { invokedFunctionArn: 'my-offline-function' });
        expect(di.isOffline).toEqual(true);
      });

      it('When process.env.USES_SERVERLESS_OFFLINE is defined', () => {
        process.env.USE_SERVERLESS_OFFLINE = 'true';
        const di = new DependencyInjection({}, getEvent, { invokedFunctionArn: 'my-function' });
        expect(di.isOffline).toEqual(true);
      });
    });

    describe('is false`', () => {
      it("When the invokedFunctionArn doesn't contain `offline", () => {
        const di = new DependencyInjection({}, getEvent, { invokedFunctionArn: 'my-function' });
        expect(di.isOffline).toEqual(false);
      });
    });
  });
});
