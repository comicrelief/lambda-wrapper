import StatusModel, { STATUS_TYPES } from '@/src/models/StatusModel';

describe('unit.models.StatusModel', () => {
  describe('getService', () => {
    it('should return the service name', () => {
      const statusModel = new StatusModel('test', STATUS_TYPES.OK);
      expect(statusModel.getService()).toEqual('test');
    });
  });

  describe('setService', () => {
    it('should set the service name', () => {
      const statusModel = new StatusModel('test', STATUS_TYPES.OK);
      statusModel.setService('other');
      expect(statusModel.getService()).toEqual('other');
    });
  });

  describe('getStatus', () => {
    it('should return the status', () => {
      const statusModel = new StatusModel('test', STATUS_TYPES.OK);
      expect(statusModel.getStatus()).toEqual(STATUS_TYPES.OK);
    });
  });

  describe('setStatus', () => {
    it('should set the status', () => {
      const statusModel = new StatusModel('test', STATUS_TYPES.OK);
      statusModel.setStatus(STATUS_TYPES.ACCEPTABLE_FAILURE);
      expect(statusModel.getStatus()).toEqual(STATUS_TYPES.ACCEPTABLE_FAILURE);
    });

    it('should throw an error when trying to set an invalid status', () => {
      const statusModel = new StatusModel('test', STATUS_TYPES.OK);
      expect(() => statusModel.setStatus('invalid'))
        .toThrow('StatusModel - invalid is not a valid status type');
    });
  });
});
