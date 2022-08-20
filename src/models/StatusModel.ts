export const STATUS_TYPES = {
  OK: 'OK',
  ACCEPTABLE_FAILURE: 'ACCEPTABLE_FAILURE',
  APPLICATION_FAILURE: 'APPLICATION_FAILURE',
};

/**
 * Model for our status check endpoints.
 */
export default class StatusModel {
  /**
   * Service name.
   */
  service: string;

  /**
   * One of the `STATUS_TYPES` values.
   */
  status: string;

  constructor(service: string, status: string) {
    this.service = service;
    this.status = status;
  }

  /**
   * Get the service name.
   */
  getService(): string {
    return this.service;
  }

  /**
   * Set the service name.
   *
   * @param service
   */
  setService(service: string) {
    this.service = service;
  }

  /**
   * Set the status.
   *
   * @param status
   */
  setStatus(status: string) {
    if (!(status in STATUS_TYPES)) {
      throw new TypeError(`${StatusModel.name} - ${status} is not a valid status type`);
    }

    this.status = status;
  }

  /**
   * Get the status.
   */
  getStatus(): string {
    return this.status;
  }
}
