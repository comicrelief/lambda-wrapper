import { v4 as UUID } from 'uuid';

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
    this.eventTime = new Date().toISOString();
    this.extensions = {};
    this.contentType = 'application/json';
    this.data = {};
  }

  /**
   * Get Cloud Events Version
   *
   * @returns {number}
   */
  getCloudEventsVersion(): string {
    return this.cloudEventsVersion;
  }

  /**
   * Get event type
   *
   * @returns {string|*}
   */
  getEventType() {
    return this.eventType;
  }

  /**
   * Set event type
   *
   * @param value string
   */
  setEventType(value: string) {
    this.eventType = value;
  }

  /**
   * Get source
   *
   * @returns {string|*}
   */
  getSource() {
    return this.source;
  }

  /**
   * Set source
   *
   * @param value string
   */
  setSource(value: string) {
    this.source = value;
  }

  /**
   * Get event id
   *
   * @returns {*|string}
   */
  getEventID() {
    return this.eventID;
  }

  /**
   * Get event time
   *
   * @returns {*|string}
   */
  getEventTime() {
    return this.eventTime;
  }

  /**
   * Get extensions
   *
   * @returns {{}|*}
   */
  getExtensions() {
    return this.extensions;
  }

  /**
   * Set extensions
   *
   * @param value object
   */
  setExtensions(value: object) {
    this.extensions = value;
  }

  /**
   * Get content type
   *
   * @returns {string}
   */
  getContentType() {
    return this.contentType;
  }

  /**
   * Get data
   *
   * @returns {{}|*}
   */
  getData() {
    return this.data;
  }

  /**
   * Set data
   *
   * @param value object
   */
  setData(value: object) {
    this.data = value;
  }
}
