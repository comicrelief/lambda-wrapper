/* @flow */
import QueryString from 'querystring';
import validate from 'validate.js/validate';
import XML2JS from 'xml2js';

import DependencyAwareClass from '../DependencyInjection/DependencyAware.class';
import ResponseModel from '../Model/Response.model';
import {DEFINITIONS} from "../Config/Dependencies";

export const REQUEST_TYPES = {
  GET: 'GET',
  POST: 'POST',
};

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
   * @param param
   * @param ifNull
   * @param requestType
   * @return {*}
   */
  get(param: string, ifNull = null, requestType = null) {
    const queryParams = this.getAll(requestType);

    if (queryParams === null) {
      return ifNull;
    }

    return typeof queryParams[param] !== 'undefined' ? queryParams[param] : ifNull;
  }

  /**
   * Get authorization token
   * @return {*}
   */
  getAuthorizationToken() {
    const { headers } = this.getContainer().getEvent();

    if (typeof headers.Authorization === 'undefined' && typeof headers.authorization === 'undefined') {
      return null;
    }

    const tokenParts = headers[typeof headers.Authorization === 'undefined' ? 'authorization' : 'Authorization'].split(' ');
    const tokenValue = tokenParts[1];

    if (!(tokenParts[0].toLowerCase() === 'bearer' && tokenValue)) {
      return null;
    }

    return tokenValue;
  }

  /**
   * Get a path parameter
   * @param param  string|null
   * @param ifNull mixed
   * @return {*}
   */
  getPathParameter(param: string = null, ifNull = {}) {
    const event = this.getContainer().getEvent();

    // If no parameter has been requested, return all path parameters
    if (param === null && typeof event.pathParameters === 'object') {
      return event.pathParameters;
    }

    // If a specifc parameter has been requested, return the parameter if it exists
    if (typeof param === 'string' && typeof event.pathParameters === 'object' && event.pathParameters !== null && typeof event.pathParameters[param] !== 'undefined') {
      return event.pathParameters[param];
    }

    return ifNull;
  }

  /**
   * Get all request parameters
   * @param requestType
   * @return {{}}
   */
  getAll(requestType = null) {
    const event = this.getContainer().getEvent();

    if (event.httpMethod === 'GET' || requestType === REQUEST_TYPES.GET) {
      return typeof event.queryStringParameters !== 'undefined' ? event.queryStringParameters : {};
    }

    if (event.httpMethod === 'POST' || requestType === REQUEST_TYPES.POST) {
      let queryParams = {};

      if ((typeof event.headers['Content-Type'] !== 'undefined' && event.headers['Content-Type'].indexOf('application/x-www-form-urlencoded') !== -1)
        || (typeof event.headers['content-type'] !== 'undefined' && event.headers['content-type'].indexOf('application/x-www-form-urlencoded') !== -1)) {
        queryParams = QueryString.parse(event.body);
      }

      if ((typeof event.headers['Content-Type'] !== 'undefined' && event.headers['Content-Type'].indexOf('application/json') !== -1)
        || (typeof event.headers['content-type'] !== 'undefined' && event.headers['content-type'].indexOf('application/json') !== -1)) {
        try {
          queryParams = JSON.parse(event.body);
        } catch (e) {
          queryParams = {};
        }
      }

      if ((typeof event.headers['Content-Type'] !== 'undefined' && event.headers['Content-Type'].indexOf('text/xml') !== -1)
        || (typeof event.headers['content-type'] !== 'undefined' && event.headers['content-type'].indexOf('text/xml') !== -1)) {
        XML2JS.parseString(event.body, ((err, result) => {
          if (err) {
            queryParams = {};
          } else {
            queryParams = result;
          }
        }));
      }
      if ((typeof event.headers['Content-Type'] !== 'undefined' && event.headers['Content-Type'].indexOf('multipart/form-data') !== -1)
        || (typeof event.headers['content-type'] !== 'undefined' && event.headers['content-type'].indexOf('multipart/form-data') !== -1)) {
        queryParams = this.parseForm(true);
      }
      return typeof queryParams !== 'undefined' ? queryParams : {};
    }

    return null;
  }

  /**
   * Fetch the request IP address
   * @return {*}
   */
  getIp() {
    const event = this.getContainer().getEvent();

    if (typeof event.requestContext !== 'undefined'
      && typeof event.requestContext.identity !== 'undefined'
      && typeof event.requestContext.identity.sourceIp !== 'undefined') {
      return event.requestContext.identity.sourceIp;
    }

    return null;
  }

  /**
   * Test a request against validation constraints
   * @param constraints
   * @return {Promise<any>}
   */
  validateAgainstConstraints(constraints: object) {
    const Logger = this.getContainer().get(DEFINITIONS.LOGGER);

    return new Promise((resolve, reject) => {
      const validation = validate(this.getAll(), constraints);

      if (typeof validation === 'undefined') {
        resolve();
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
   * @param useBuffer
   * @return {*}
   */
  parseForm(useBuffer: boolean) {
    const event = this.getContainer().getEvent();
    const boundary = this.getBoundary(event);

    const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('binary').trim() : event.body;

    const result = {};
    body
      .split(boundary)
      .forEach((item) => {
        if (/filename=".+"/g.test(item)) {
          result[item.match(/name=".+";/g)[0].slice(6, -2)] = {
            type: 'file',
            filename: item.match(/filename=".+"/g)[0].slice(10, -1),
            contentType: item.match(/Content-Type:\s.+/g)[0].slice(14),
            content: useBuffer ? Buffer.from(item.slice(item.search(/Content-Type:\s.+/g) + item.match(/Content-Type:\s.+/g)[0].length + 4, -4), 'binary')
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
   * @return {*}
   */
  getAWSRecords() {
    const event = this.getContainer().getEvent();
    const eventRecord = event.Records && event.Records[0];

    if (typeof event.Records !== 'undefined'
      && typeof event.Records[0] !== 'undefined'
      && typeof eventRecord.eventSource !== 'undefined') {
      return eventRecord;
    }
    return null;
  }


  getValueIgnoringKeyCase(object, key) {
    const foundKey = Object
      .keys(object)
      .find(currentKey => currentKey.toLocaleLowerCase() === key.toLowerCase());
    return object[foundKey];
  }

  getBoundary(event) {
    return this.getValueIgnoringKeyCase(event.headers, 'Content-Type').split('=')[1];
  }
}
