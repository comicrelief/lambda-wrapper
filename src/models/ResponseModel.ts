/**
 * HTTP headers to be included in all responses.
 */
export const RESPONSE_HEADERS = {
  'Content-Type': 'application/json',
  /** Required for CORS support to work */
  'Access-Control-Allow-Origin': '*',
  /** Required for cookies, authorization headers with HTTPS */
  'Access-Control-Allow-Credentials': true,
};

/**
 * Default message provided as part of response.
 */
export const DEFAULT_MESSAGE = 'success';

/**
 * Our standard response model for HTTP endpoints.
 */
export default class ResponseModel {
  body: any;

  code: any;

  constructor(data?: any, code?: number, message?: string) {
    this.body = {
      data: data ?? {},
      message: message ?? DEFAULT_MESSAGE,
    };
    this.code = code ?? {};
  }

  /**
   * Add or update a body variable.
   *
   * @param key
   * @param value
   */
  setBodyVariable(key: string, value: any) {
    this.body[key] = value;
  }

  /**
   * Set data.
   *
   * @param data
   */
  setData(data: object) {
    this.body.data = data;
  }

  /**
   * Set status code.
   *
   * @param code
   */
  setCode(code: number) {
    this.code = code;
  }

  /**
   * Get status code.
   */
  getCode() {
    return this.code;
  }

  /**
   * Set message.
   *
   * @param message
   */
  setMessage(message: string) {
    this.body.message = message;
  }

  /**
   * Get message.
   */
  getMessage() {
    return this.body.message;
  }

  /**
   * Geneate a response.
   */
  generate() {
    return {
      statusCode: this.code,
      headers: RESPONSE_HEADERS,
      body: JSON.stringify(this.body),
    };
  }

  /**
   * Shorthand static method that generates the response immediately if no
   * additional processing is required.
   *
   * Saves only 1 line of code but keeps code terse in a lot of places.
   *
   * @param data
   * @param code
   * @param message
   */
  static generate(data?: any, code?: number, message?: string) {
    const response = new this(data, code, message);
    return response.generate();
  }
}
