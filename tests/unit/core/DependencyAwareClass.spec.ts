import { Context, DependencyAwareClass, DependencyInjection } from '@/src';

describe('unit.core.DependencyAwareClass', () => {
  describe('getContainer', () => {
    it('should return the DependencyInjection instance', () => {
      const di = new DependencyInjection({ dependencies: {} }, {}, {} as Context);
      const dep = new DependencyAwareClass(di);
      expect(dep.getContainer()).toBe(di);
    });
  });

  describe('di', () => {
    it('should expose the DependencyInjection instance', () => {
      const di = new DependencyInjection({ dependencies: {} }, {}, {} as Context);
      const dep = new DependencyAwareClass(di);
      expect(dep.di).toBe(di);
    });
  });
});
