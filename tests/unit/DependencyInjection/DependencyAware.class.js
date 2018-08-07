import ServerlessMochaPlugin from 'serverless-mocha-plugin';
import DependencyInjection from '../../../src/DependencyInjection/DependencyInjection.class';
import DependencyAware from '../../../src/DependencyInjection/DependencyAware.class';

let getEvent = require('../../mocks/aws/event.json');
let getContext = require('../../mocks/aws/context.json');

const expect = ServerlessMochaPlugin.chai.expect;

describe('DependencyInjection/DependencyAwareClass', () => {

  const dependencyInjectionClass = new DependencyInjection({}, getEvent, getContext);
  const dependencyAwareClass = new DependencyAware(dependencyInjectionClass);

  it('should instantiate and be able to get the dependency injection container', () => {
    expect(dependencyAwareClass.getContainer()).to.eql(dependencyInjectionClass);
  });

});
