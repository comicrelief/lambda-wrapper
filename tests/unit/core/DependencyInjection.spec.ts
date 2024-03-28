import { DependencyInjection } from '@/src';
import { mockContext, mockEvent } from '@/tests/mocks/aws';
import {
  A,
  B,
  C,
  ServiceA,
} from '@/tests/mocks/dependencies';
import {
  A as AClash,
  ServiceA as ServiceAClash,
} from '@/tests/mocks/dependencies2';

describe('unit.core.DependencyInjection', () => {
  const mockConfig = {
    dependencies: {
      A,
      B,
    },
  };

  const di = new DependencyInjection(mockConfig, mockEvent, mockContext);

  describe('constructor', () => {
    describe('dependency conflicts', () => {
      it('should throw if dependencies have conflicting names', () => {
        const clashConfig = {
          dependencies: {
            ServiceA,
            ServiceAClash,
          },
        };

        expect(
          () => new DependencyInjection(clashConfig, mockEvent, mockContext),
        ).toThrowError('ensure that all dependency classes have a unique name');
      });

      it('should suggest turning off minification if names are single-letter', () => {
        const clashConfig = {
          dependencies: {
            A,
            AClash,
          },
        };

        expect(
          () => new DependencyInjection(clashConfig, mockEvent, mockContext),
        ).toThrowError('your bundler may be minifying your code');
      });

      it('should not throw if the same dependency is included twice', () => {
        const okayConfig = {
          dependencies: {
            A,
            again: A,
          },
        };

        expect(
          () => new DependencyInjection(okayConfig, mockEvent, mockContext),
        ).not.toThrow();
      });
    });
  });

  describe('event', () => {
    it('should expose the event', () => {
      expect(di.event).toBe(mockEvent);
    });
  });

  describe('context', () => {
    it('should expose the Lambda context', () => {
      expect(di.context).toBe(mockContext);
    });
  });

  describe('config', () => {
    it('should expose the config object', () => {
      expect(di.config).toBe(mockConfig);
    });
  });

  describe('get', () => {
    it('should return an instance of A, given A', () => {
      expect(di.get(A)).toBeInstanceOf(A);
    });

    it('should return an instance of B, given B', () => {
      expect(di.get(B)).toBeInstanceOf(B);
    });

    it('should throw, given an unknown dependency', () => {
      expect(() => di.get(C)).toThrow('C does not exist in dependency container');
    });
  });

  describe('getEvent', () => {
    it('should return the event', () => {
      expect(di.getEvent()).toBe(mockEvent);
    });
  });

  describe('getContext', () => {
    it('should return the Lambda context', () => {
      expect(di.getContext()).toBe(mockContext);
    });
  });

  describe('getConfiguration', () => {
    it('should return the config object', () => {
      expect(di.getConfiguration()).toBe(mockConfig);
    });
  });
});
