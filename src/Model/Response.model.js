import Model from './Model.model';

/**
 *
 * @type {object}
 */
export const RESPONSE_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*', // Required for CORS support to work
  'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
};

/**
 * Default message provided as part of response
 *
 * @type {string}
 */
export const DEFAULT_MESSAGE = 'success';

/**
 * class ResponseModel
 */
export default class ResponseModel extends Model {
  /**
   * ResponseModel Constructor
   *
   * @param data
   * @param code
   * @param message
   */
  constructor(data = null, code = null, message = null) {
    super();

    this.body = {
      data: data !== null ? data : {},
      message: message !== null ? message : DEFAULT_MESSAGE,
    };
    this.code = code !== null ? code : {};
  }

  /**
   * Add or update a body variable
   *
   * @param variable
   * @param value
   */
  setBodyVariable(variable: string, value) {
    this.body[variable] = value;
  }

  /**
   * Set Data
   *
   * @param data
   */
  setData(data: object) {
    this.body.data = data;
  }

  /**
   * Set Status Code
   *
   * @param code
   */
  setCode(code: number) {
    this.code = code;
  }

  /**
   * Get Status Code
   *
   * @returns {*}
   */
  getCode() {
    return this.code;
  }

  /**
   * Set message
   *
   * @param message
   */
  setMessage(message: string) {
    this.body.message = message;
  }

  /**
   * Get Message
   *
   * @returns {string|*}
   */
  getMessage() {
    return this.body.message;
  }

  /**
   * Geneate a response
   *
   * @returns {object}
   */
  generate() {
    return {
      statusCode: this.code,
      headers: RESPONSE_HEADERS,
      body: JSON.stringify(this.body),
    };
  }

  /**
   * Shorthand static method
   * that generates the response immediately
   * if no additional processing is required.
   *
   * Saves only 1 line of code
   * but keeps code terse in a lot of places.
   *
   * @param {*} data
   * @param {*} code
   * @param {*} message
   * @returns {object}
   */
  static generate(data = null, code = null, message = null) {
    const response = new this(data, code, message);

    return response.generate();
  }
}
