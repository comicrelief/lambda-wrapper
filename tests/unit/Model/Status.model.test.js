import StatusModel, { STATUS_TYPES } from '../../../src/Model/Status.model';

// Test definitions.
describe('Model/StatusModel', () => {
  describe('Ensure setting and getting of variables', () => {
    const service = 'test';
    const status = STATUS_TYPES.OK;
    const statusModel = new StatusModel(service, status);

    it('should set ang get the service', () => {
      expect(statusModel.getService()).toEqual(service);
    });

    it('should set and get the status', () => {
      expect(statusModel.getStatus()).toEqual(status);
    });

    it('should throw an error when trying to set an invalid status', () => {
      expect(() => statusModel.setStatus('invalid')).toThrow('StatusModel - invalid is not a valid status type');
    });
  });
});
