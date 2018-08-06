/* @flow */
import QueryString from 'querystring';
import validate from 'validate.js/validate';
import XML2JS from 'xml2js';

import DependencyAwareClass from '../DependencyInjection/DependencyAware.class';
import ResponseModel from '../Model/Response.model';

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
        queryParams = JSON.parse(event.body);
      }

      if ((typeof event.headers['Content-Type'] !== 'undefined' && event.headers['Content-Type'].indexOf('text/xml') !== -1)
        || (typeof event.headers['content-type'] !== 'undefined' && event.headers['content-type'].indexOf('text/xml') !== -1)) {
        XML2JS.parseString(event.body, ((err, result) => {
          queryParams = result;
        }));
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
    return new Promise((resolve, reject) => {
      const validation = validate(this.getAll(), constraints);

      if (typeof validation === 'undefined') {
        resolve();
      } else {
        const validationErrorResponse = ERROR_TYPES.VALIDATION_ERROR;
        validationErrorResponse.setBodyVariable('validation_errors', validation);

        reject(validationErrorResponse);
      }
    });
  }
}
