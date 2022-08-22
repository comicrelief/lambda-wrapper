import DependencyInjection from '../../../src/DependencyInjection/DependencyInjection.class';
// The import order is relevant here to avoid circular imports
// eslint-disable-next-line import/order
import DependencyAware from '../../../src/DependencyInjection/DependencyAware.class';
import getContext from '../../mocks/aws/context.json';
import getEvent from '../../mocks/aws/event.json';

describe('DependencyInjection/DependencyAwareClass', () => {
  describe('getContainer', () => {
    const dependencyInjectionClass = new DependencyInjection({}, getEvent, getContext);
    const dependencyAwareClass = new DependencyAware(dependencyInjectionClass);

    it('should instantiate and be able to get the dependency injection container', () => {
      expect(dependencyAwareClass.getContainer()).toEqual(dependencyInjectionClass);
    });
  });

  describe('definitions', () => {
    describe('Returns the provided definitions', () => {
      [
        [{}, undefined],
        [{ DEFINITIONS: 1 }, 1],
      ].forEach(([configuration, expected]) => {
        it(`With configuration: ${configuration}`, () => {
          const di = new DependencyInjection(configuration);
          const service = new DependencyAware(di);
          expect(service.definitions).toEqual(expected);
        });
      });
    });
  });
});
