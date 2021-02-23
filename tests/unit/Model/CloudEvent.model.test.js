import CloudEventModel from '../../../src/Model/CloudEvent.model';

// Test definitions.
describe('Model/CloudEventModel', () => {
  describe('Ensure setting and getting of variables', () => {
    const model = new CloudEventModel();

    it('should get the cloud event version', () => {
      expect(model.getCloudEventsVersion()).toEqual('0.1');
    });

    it('should set and get the event type', () => {
      expect(model.getEventType()).toEqual('');
      const eventType = 'test.event';
      model.setEventType(eventType);
      expect(model.getEventType()).toEqual(eventType);
    });

    it('should set and get the source', () => {
      expect(model.getSource()).toEqual('');
      const source = 'test';
      model.setSource(source);
      expect(model.getSource()).toEqual(source);
    });

    it('should generate a uuid as the event id', () => {
      expect(model.getEventID().length).toEqual(36);
    });

    it('should generate the current timestamp as the current time', () => {
      expect(new CloudEventModel().getEventTime().replace(/:[^:]+$/, '')).toEqual(new Date().toISOString().replace(/:[^:]+$/, ''));
    });

    it('should set and get the extensions', () => {
      expect(model.getExtensions()).toEqual({});

      const extensions = {
        test: 'test',
      };
      model.setExtensions(extensions);
      expect(model.getExtensions()).toEqual(extensions);
    });

    it('should get the content type', () => {
      expect(model.getContentType()).toEqual('application/json');
    });

    it('should set and get the extensions', () => {
      expect(model.getData()).toEqual({});

      const data = {
        test: 'test',
      };
      model.setData(data);
      expect(model.getData()).toEqual(data);
    });
  });
});
