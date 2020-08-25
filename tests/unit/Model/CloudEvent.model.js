import ServerlessMochaPlugin from 'serverless-mocha-plugin';
import CloudEventModel from '../../../src/Model/CloudEvent.model';

const { expect } = ServerlessMochaPlugin.chai;

// Test definitions.
describe('Model/CloudEventModel', () => {
  describe('Ensure setting and getting of variables', () => {
    const model = new CloudEventModel();

    it('should get the cloud event version', () => {
      expect(model.getCloudEventsVersion()).to.eql('0.1');
    });

    it('should set and get the event type', () => {
      expect(model.getEventType()).to.eql('');
      const eventType = 'test.event';
      model.setEventType(eventType);
      expect(model.getEventType()).to.eql(eventType);
    });

    it('should set and get the source', () => {
      expect(model.getSource()).to.eql('');
      const source = 'test';
      model.setSource(source);
      expect(model.getSource()).to.eql(source);
    });

    it('should generate a uuid as the event id', () => {
      expect(model.getEventID().length).to.eql(36);
    });

    it('should generate the current timestamp as the current time', () => {
      expect(new CloudEventModel().getEventTime().replace(/:[^:]+$/, '')).to.eql(new Date().toISOString().replace(/:[^:]+$/, ''));
    });

    it('should set and get the extensions', () => {
      expect(model.getExtensions()).to.eql({});

      const extensions = {
        test: 'test',
      };
      model.setExtensions(extensions);
      expect(model.getExtensions()).to.eql(extensions);
    });

    it('should get the content type', () => {
      expect(model.getContentType()).to.eql('application/json');
    });

    it('should set and get the extensions', () => {
      expect(model.getData()).to.eql({});

      const data = {
        test: 'test',
      };
      model.setData(data);
      expect(model.getData()).to.eql(data);
    });
  });
});
