import DependencyInjection from '../../../src/DependencyInjection/DependencyInjection.class';
import DependencyAware from '../../../src/DependencyInjection/DependencyAware.class';

const getEvent = require('../../mocks/aws/event.json');
const getContext = require('../../mocks/aws/context.json');

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
      ].forEach((testCase) => {
        it(`With configuration: ${testCase[0]}`, () => {
          const di = new DependencyInjection(testCase[0]);
          const service = new DependencyAware(di);
          expect(service.definitions).toEqual(testCase[1]);
        });
      });
    });
  });
});
