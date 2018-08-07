import UUID from 'uuid/v4';
import Model from './Model.model';

/**
 * CloudEventModel class
 * Class to implement cloud events - https://github.com/cloudevents/spec/blob/master/spec.md
 */
export default class CloudEventModel extends Model {
  /**
   * CloudEventModel constructor
   */
  constructor() {
    super();

    this.cloudEventsVersion = '0.1';
    this.eventType = '';
    this.source = '';
    this.eventID = UUID();
    this.eventTime = (new Date()).toISOString();
    this.extensions = {};
    this.contentType = 'application/json';
    this.data = {};
  }

  /**
   * Get Cloud Events Version
   * @return {number}
   */
  getCloudEventsVersion(): string {
    return this.cloudEventsVersion;
  }

  /**
   * Get event type
   * @return {string|*}
   */
  getEventType() {
    return this.eventType;
  }

  /**
   * Set event type
   * @param value string
   */
  setEventType(value: string) {
    this.eventType = value;
  }

  /**
   * Get source
   * @return {string|*}
   */
  getSource() {
    return this.source;
  }

  /**
   * Set source
   * @param value string
   */
  setSource(value: string) {
    this.source = value;
  }

  /**
   * Get event id
   * @return {*|string}
   */
  getEventID() {
    return this.eventID;
  }

  /**
   * Get event time
   * @return {*|string}
   */
  getEventTime() {
    return this.eventTime;
  }

  /**
   * Get extensions
   * @return {{}|*}
   */
  getExtensions() {
    return this.extensions;
  }

  /**
   * Set extensions
   * @param value object
   */
  setExtensions(value: object) {
    this.extensions = value;
  }

  /**
   * Get content type
   * @return {string}
   */
  getContentType() {
    return this.contentType;
  }

  /**
   * Get data
   * @return {{}|*}
   */
  getData() {
    return this.data;
  }

  /**
   * Set data
   * @param value object
   */
  setData(value: object) {
    this.data = value;
  }
}
