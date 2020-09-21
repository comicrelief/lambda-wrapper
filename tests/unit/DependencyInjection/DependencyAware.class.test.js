import DependencyInjection from '../../../src/DependencyInjection/DependencyInjection.class';
import DependencyAware from '../../../src/DependencyInjection/DependencyAware.class';

const getEvent = require('../../mocks/aws/event.json');
const getContext = require('../../mocks/aws/context.json');

describe('DependencyInjection/DependencyAwareClass', () => {
  const dependencyInjectionClass = new DependencyInjection({}, getEvent, getContext);
  const dependencyAwareClass = new DependencyAware(dependencyInjectionClass);

  it('should instantiate and be able to get the dependency injection container', () => {
    expect(dependencyAwareClass.getContainer()).toEqual(dependencyInjectionClass);
  });
});
