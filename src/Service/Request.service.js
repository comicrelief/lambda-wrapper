/* eslint-disable class-methods-use-this */
/* eslint-disable sonarjs/no-duplicate-string */
/* @flow */
import QueryString from 'querystring';

import useragent from 'useragent';
import validate from 'validate.js/validate';
import XML2JS from 'xml2js';

import { DEFINITIONS } from '../Config/Dependencies';
import DependencyAwareClass from '../DependencyInjection/DependencyAware.class';
import ResponseModel from '../Model/Response.model';

export const REQUEST_TYPES = {
  GET: 'GET',
  OPTIONS: 'OPTIONS',
  HEAD: 'HEAD',
  DELETE: 'DELETE',
  POST: 'POST',
  PATCH: 'PATCH',
  PUT: 'PUT',
};

export const HTTP_METHODS_WITH_PAYLOADS = [
  REQUEST_TYPES.POST,
  REQUEST_TYPES.PUT,
  REQUEST_TYPES.PATCH,
];

export const HTTP_METHODS_WITHOUT_PAYLOADS = [
  REQUEST_TYPES.GET,
  REQUEST_TYPES.OPTIONS,
  REQUEST_TYPES.HEAD,
  REQUEST_TYPES.DELETE,
];

// Define action specific error types
export const ERROR_TYPES = {
  VALIDATION_ERROR: new ResponseModel({}, 400, 'required fields are missing'),
};

/**
 * RequestService class
 */
export default class RequestService extends DependencyAwareClass {
  /**
   * Get a parameter from the request.
   *
   * @param parameter
   * @param ifNull
   * @param requestType
   */
  get(parameter: string, ifNull = null, requestType = null) {
    const queryParameters = this.getAll(requestType);

    if (queryParameters === null) {
      return ifNull;
    }

    return typeof queryParameters[parameter] !== 'undefined' ? queryParameters[parameter] : ifNull;
  }

  /**
   * Get all HTTP headers included in the request.
   *
   * @returns {object} An object with a key for each header.
   */
  getAllHeaders() {
    return { ...this.getContainer().getEvent().headers };
  }

  /**
   * Get an HTTP header from the request.
   *
   * The header name is case-insensitive.
   *
   * @param {string} name The name of the header.
   * @param {string} [whenMissing] Value to return if the header is missing.
   *   (default: empty string)
   *
   * @returns {string}
   */
  getHeader(name: string, whenMissing: string = '') {
    const headers = this.getAllHeaders();
    if (!headers) {
      return whenMissing;
    }
    const lowerName = name.toLowerCase();
    const key = Object.keys(headers).find((k) => k.toLowerCase() === lowerName);
    return (key && headers[key]) || whenMissing;
  }

  /**
   * Get authorization token
   *
   * @returns {*}
   */
  getAuthorizationToken() {
    const authorization = this.getHeader('Authorization');
    if (!authorization) {
      return null;
    }

    const tokenParts = authorization.split(' ');
    const tokenValue = tokenParts[1];

    if (!(tokenParts[0].toLowerCase() === 'bearer' && tokenValue)) {
      return null;
    }

    return tokenValue;
  }

  /**
   * Get a path parameter
   *
   * @param parameter
   * @param ifNull mixed
   */
  getPathParameter(parameter: string = null, ifNull = {}) {
    const event = this.getContainer().getEvent();

    // If no parameter has been requested, return all path parameters
    if (parameter === null && typeof event.pathParameters === 'object') {
      return event.pathParameters;
    }

    // If a specifc parameter has been requested, return the parameter if it exists
    if (
      typeof parameter === 'string'
      && typeof event.pathParameters === 'object'
      && event.pathParameters !== null
      && typeof event.pathParameters[parameter] !== 'undefined'
    ) {
      return event.pathParameters[parameter];
    }

    return ifNull;
  }

  /**
   * Get all request parameters
   *
   * @param requestType
   * @returns {{}}
   */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  getAll(requestType = null) {
    const event = this.getContainer().getEvent();

    if (HTTP_METHODS_WITHOUT_PAYLOADS.includes(event.httpMethod) || HTTP_METHODS_WITHOUT_PAYLOADS.includes(requestType)) {
      return typeof event.queryStringParameters !== 'undefined' ? event.queryStringParameters : {};
    }

    if (HTTP_METHODS_WITH_PAYLOADS.includes(event.httpMethod) || HTTP_METHODS_WITH_PAYLOADS.includes(requestType)) {
      const contentType = this.getHeader('Content-Type');
      let queryParameters = {};

      if (contentType.includes('application/x-www-form-urlencoded')) {
        queryParameters = QueryString.parse(event.body);
      }

      if (contentType.includes('application/json')) {
        try {
          queryParameters = JSON.parse(event.body);
        } catch {
          queryParameters = {};
        }
      }

      if (contentType.includes('text/xml')) {
        XML2JS.parseString(event.body, (error, result) => {
          queryParameters = error ? {} : result;
        });
      }

      if (contentType.includes('multipart/form-data')) {
        queryParameters = this.parseForm(true);
      }

      return typeof queryParameters !== 'undefined' ? queryParameters : {};
    }

    return null;
  }

  /**
   * Fetch the request IP address
   *
   * @returns {*}
   */
  getIp() {
    const event = this.getContainer().getEvent();

    if (
      typeof event.requestContext !== 'undefined'
      && typeof event.requestContext.identity !== 'undefined'
      && typeof event.requestContext.identity.sourceIp !== 'undefined'
    ) {
      return event.requestContext.identity.sourceIp;
    }

    return null;
  }

  /**
   * Get user agent
   *
   * @returns {*}
   */
  getUserBrowserAndDevice() {
    const userAgent = this.getHeader('user-agent', null);
    if (userAgent === null) {
      return null;
    }

    try {
      const agent = useragent.parse(userAgent);
      const os = agent.os.toJSON();

      return {
        'browser-type': agent.family,
        'browser-version': agent.toVersion(),
        'device-type': agent.device.family,
        'operating-system': os.family,
        'operating-system-version': agent.os.toVersion(),
      };
    } catch {
      this.getContainer().get(DEFINITIONS.LOGGER).label('user-agent-parsing-failed');

      return null;
    }
  }

  /**
   * Test a request against validation constraints
   *
   * @param constraints
   * @returns {Promise<any>}
   */
  validateAgainstConstraints(constraints: object) {
    const Logger = this.getContainer().get(DEFINITIONS.LOGGER);

    return new Promise((resolve, reject) => {
      const validation = validate(this.getAll(), constraints);

      if (typeof validation === 'undefined') {
        resolve(true);
      } else {
        Logger.label('request-validation-failed');
        const validationErrorResponse = ERROR_TYPES.VALIDATION_ERROR;
        validationErrorResponse.setBodyVariable('validation_errors', validation);

        reject(validationErrorResponse);
      }
    });
  }

  /**
   * Fetch the request multipart form
   *
   * @param useBuffer
   * @returns {*}
   */
  parseForm(useBuffer: boolean) {
    const event = this.getContainer().getEvent();
    const boundary = this.getBoundary(event);

    const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('binary').trim() : event.body;

    const result = {};
    body.split(boundary).forEach((item) => {
      if (/filename=".+"/g.test(item)) {
        result[item.match(/name=".+";/g)[0].slice(6, -2)] = {
          type: 'file',
          filename: item.match(/filename=".+"/g)[0].slice(10, -1),
          contentType: item.match(/Content-Type:\s.+/g)[0].slice(14),
          content: useBuffer
            ? Buffer.from(item.slice(item.search(/Content-Type:\s.+/g) + item.match(/Content-Type:\s.+/g)[0].length + 4, -4), 'binary')
            : item.slice(item.search(/Content-Type:\s.+/g) + item.match(/Content-Type:\s.+/g)[0].length + 4, -4),
        };
      } else if (/name=".+"/g.test(item)) {
        result[item.match(/name=".+"/g)[0].slice(6, -1)] = item.slice(item.search(/name=".+"/g) + item.match(/name=".+"/g)[0].length + 4, -4);
      }
    });
    return result;
  }

  /**
   * Fetch the request AWS event Records
   *
   * @returns {*}
   */
  getAWSRecords() {
    const event = this.getContainer().getEvent();
    const eventRecord = event.Records && event.Records[0];

    if (typeof event.Records !== 'undefined' && typeof event.Records[0] !== 'undefined' && typeof eventRecord.eventSource !== 'undefined') {
      return eventRecord;
    }
    return null;
  }

  /**
   * Gets a value independently from
   * the case of the key
   *
   * @param object
   * @param key
   */
  getValueIgnoringKeyCase(object, key) {
    const foundKey = Object.keys(object).find((currentKey) => currentKey.toLocaleLowerCase() === key.toLowerCase());
    return object[foundKey];
  }

  /**
   * Returns the content type
   * assoiated with the request
   *
   * @param event
   */
  getBoundary(event) {
    return this.getValueIgnoringKeyCase(event.headers, 'Content-Type').split('=')[1];
  }
}
