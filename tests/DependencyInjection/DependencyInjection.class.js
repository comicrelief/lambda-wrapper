import ServerlessMochaPlugin from 'serverless-mocha-plugin';
import { DependencyInjection } from '@comicrelief/lapper';
import { DEFINITIONS } from '../../../../src/Config/Dependencies';

import RequestService from "../../../../src/Service/Request.service";
import DatabaseService from "../../../../src/Service/Database.service";
import LoggerService from "../../../../src/Service/Logger.service";
import SQSService from "../../../../src/Service/SQS.service";
import ClientResolver from "../../../../src/Resolver/Client.resolver";
import DeltaResolver from "../../../../src/Resolver/Delta.resolver";
import ProviderResolver from "../../../../src/Resolver/Provider.resolver";
import TransactionResolver from "../../../../src/Resolver/Transaction.resolver";

const expect = ServerlessMochaPlugin.chai.expect;

let getEvent = require('../../../../tests/mocks/aws/event.json');
let getContext = require('../../../../tests/mocks/aws/context.json');

describe('DependencyInjection', () => {

  describe('should instantiate', () => {

    const dependencyInjection = new DependencyInjection(getEvent, getContext);

    it('should output the event that was provided to it', () => {
      expect(dependencyInjection.getEvent()).to.eql(getEvent);
    });

    it('should output the event that was provided to it', () => {
      expect(dependencyInjection.getContext()).to.eql(getContext);
    });

  });

  describe('should get dependencies', () => {

    const dependencyInjection = new DependencyInjection(getEvent, getContext);

    it('Should throw validation errors when an non existent model is requested', () => {
      expect(() => dependencyInjection.get('test')).to.throw('test does not exist in di container');
    });

    it('should fetch an instance of the request service', () => {
      const databaseService = dependencyInjection.get(DEFINITIONS.DATABASE);
      expect(databaseService instanceof DatabaseService).to.be.true;
      expect(databaseService.di instanceof DependencyInjection).to.be.true;
    });

    it('should fetch an instance of the logger service', () => {
      expect(dependencyInjection.get(DEFINITIONS.LOGGER) instanceof LoggerService).to.be.true;
    });

    it('should fetch an instance of the request service', () => {
      const requestService = dependencyInjection.get(DEFINITIONS.REQUEST);
      expect(requestService instanceof RequestService).to.be.true;
      expect(requestService.di instanceof DependencyInjection).to.be.true;
    });

    it('should fetch an instance of the request service', () => {
      const sqsService = dependencyInjection.get(DEFINITIONS.SQS);
      expect(sqsService instanceof SQSService).to.be.true;
      expect(sqsService.di instanceof DependencyInjection).to.be.true;
    });

    it('should fetch an instance of the client resolver', () => {
      const clientResolver = dependencyInjection.get(DEFINITIONS.CLIENT_RESOLVER);
      expect(clientResolver instanceof ClientResolver).to.be.true;
      expect(clientResolver.di instanceof DependencyInjection).to.be.true;
    });

    it('should fetch an instance of the delta resolver', () => {
      const deltaResolver = dependencyInjection.get(DEFINITIONS.DELTA_RESOLVER);
      expect(deltaResolver instanceof DeltaResolver).to.be.true;
      expect(deltaResolver.di instanceof DependencyInjection).to.be.true;
    });

    it('should fetch an instance of the provider resolver', () => {
      const providerResolver = dependencyInjection.get(DEFINITIONS.PROVIDER_RESOLVER);
      expect(providerResolver instanceof ProviderResolver).to.be.true;
      expect(providerResolver.di instanceof DependencyInjection).to.be.true;
    });

    it('should fetch an instance of the transaction resolver', () => {
      const transactionResolver = dependencyInjection.get(DEFINITIONS.TRANSACTION_RESOLVER);
      expect(transactionResolver instanceof TransactionResolver).to.be.true;
      expect(transactionResolver.di instanceof DependencyInjection).to.be.true;
    });

  });

});
