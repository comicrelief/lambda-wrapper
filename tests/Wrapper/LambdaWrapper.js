import ServerlessMochaPlugin from 'serverless-mocha-plugin';
import RequestService, {REQUEST_TYPES} from '../../../../../src/Service/Request.service';
import DependencyInjection from "../../../../../src/DependencyInjection/DependencyInjection.class";
import LambdaWrapper from "../../src/Wrapper/LambdaWrapper";

const expect = ServerlessMochaPlugin.chai.expect;

let getEvent = require('../../../../../tests/mocks/aws/event.json');
let getContext = require('../../../../../tests/mocks/aws/context.json');

describe('LambdaWrapper', () => {

  let dependencyInjection = {};
  let requestService = {};

  LambdaWrapper((di, request) => {
    dependencyInjection = di;
    requestService = request;
  })(getEvent, getContext);

  describe('should inject dependency injection into the function', () => {

    it('depndency injection variables should be an instance of the dependency injection class', () => {
      expect(dependencyInjection instanceof DependencyInjection).to.be.true;
    });

    it('dependency injection should output the event that was provided to it', () => {
      expect(dependencyInjection.getEvent()).to.eql(getEvent);
    });

    it('dependency injection should output the event that was provided to it', () => {
      expect(dependencyInjection.getContext()).to.eql(getContext);
    });

  });

  describe('should inject the request service into the function', () => {

    it('request service variables should be an instance of the dependency injection class', () => {
      expect(requestService instanceof RequestService).to.be.true;
    });

    it('request service should contain variables that were sent to it via the event', () => {
      expect(requestService.get('test'), null, REQUEST_TYPES.GET).to.eql(getEvent.queryStringParameters.test);
    });

  });

});

