import Model from './Model.model';

export const STATUS_TYPES = {
  OK: 'OK',
  ACCEPTABLE_FAILURE: 'ACCEPTABLE_FAILURE',
  APPLICATION_FAILURE: 'APPLICATION_FAILURE',
};

/**
 * StatusModel Class
 */
export default class StatusModel extends Model {
  /**
   * StatusModel constructor
   * @param service
   * @param status
   */
  constructor(service: string, status: string) {
    super();

    this.setService(service);
    this.setStatus(status);
  }

  /**
   * Get Service
   * @return {*}
   */
  getService(): string {
    return this.service;
  }

  /**
   * Set Service
   * @param service
   */
  setService(service: string) {
    this.service = service;
  }

  /**
   * Set the status
   * @param status
   */
  setStatus(status: string) {
    if (typeof STATUS_TYPES[status] === 'undefined') {
      throw new Error(`${StatusModel.name} - ${status} is not a valid status type`);
    }

    this.status = status;
  }

  /**
   * Get status
   * @return {string|*}
   */
  getStatus(): string {
    return this.status;
  }
}
