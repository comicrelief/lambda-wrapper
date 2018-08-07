import ServerlessMochaPlugin from 'serverless-mocha-plugin';
import DependencyInjection from '../../../src/DependencyInjection/DependencyInjection.class';
import { DEFINITIONS } from '../../../src/Config/Dependencies';

import RequestService from "../../../src/Service/Request.service";
import LoggerService from "../../../src/Service/Logger.service";

const expect = ServerlessMochaPlugin.chai.expect;

let getEvent = require('../../mocks/aws/event.json');
let getContext = require('../../mocks/aws/context.json');

describe('DependencyInjection/DependencyInjectionClass', () => {

  describe('should instantiate', () => {

    const configuration = {
      test: 123,
    };
    const dependencyInjection = new DependencyInjection(configuration, getEvent, getContext);

    it('should output the event that was provided to it', () => {
      expect(dependencyInjection.getEvent()).to.eql(getEvent);
    });

    it('should output the context that was provided to it', () => {
      expect(dependencyInjection.getContext()).to.eql(getContext);
    });

    it('should output the configuration that was provided to it', () => {
      expect(dependencyInjection.getConfiguration()).to.eql(configuration);
    });

  });

  describe('should get dependencies', () => {

    const dependencyInjection = new DependencyInjection({}, getEvent, getContext);

    it('Should throw validation errors when an non existent model is requested', () => {
      expect(() => dependencyInjection.get('test')).to.throw('test does not exist in di container');
    });

    it('should fetch an instance of the logger service', () => {
      expect(dependencyInjection.get(DEFINITIONS.LOGGER) instanceof LoggerService).to.be.true;
    });

    it('should fetch an instance of the request service', () => {
      const requestService = dependencyInjection.get(DEFINITIONS.REQUEST);
      expect(requestService instanceof RequestService).to.be.true;
      expect(requestService.di instanceof DependencyInjection).to.be.true;
    });

  });

});
