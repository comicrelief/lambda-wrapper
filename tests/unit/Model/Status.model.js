import ServerlessMochaPlugin from 'serverless-mocha-plugin';
import StatusModel, { STATUS_TYPES } from "../../../src/Model/Status.model";

const expect = ServerlessMochaPlugin.chai.expect;

// Test definitions.
describe('Model/StatusModel', () => {

  describe('Ensure setting and getting of variables', () => {

    const service = 'test';
    const status = STATUS_TYPES.OK;
    const statusModel = new StatusModel(service, status);

    it('should set ang get the service', () => {
      expect(statusModel.getService()).to.eql(service);
    });

    it('should set and get the status', () => {
      expect(statusModel.getStatus()).to.eql(status);
    });

    it('should throw an error when trying to set an invalid status', () => {
      expect(() => statusModel.setStatus('invalid')).to.throw('StatusModel - invalid is not a valid status type');
    });

  });

});
