import { DependencyAwareClass, DependencyInjection } from '@/src';
import { mockContext, mockEvent } from '@/tests/mocks/aws';

class A extends DependencyAwareClass {}

class B extends DependencyAwareClass {}

class C extends DependencyAwareClass {}

describe('unit.core.DependencyInjection', () => {
  const mockConfig = {
    dependencies: {
      A,
      B,
    },
  };

  const di = new DependencyInjection(mockConfig, mockEvent, mockContext);

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
