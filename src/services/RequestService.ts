import QueryString from 'querystring';

import { APIGatewayProxyEvent } from 'aws-lambda';
import useragent from 'useragent';
import validate from 'validate.js/validate';
import XML2JS from 'xml2js';

import DependencyAwareClass from '../core/DependencyAwareClass';
import ResponseModel from '../models/ResponseModel';
import LoggerService from './LoggerService';

export const REQUEST_TYPES = {
  DELETE: 'DELETE',
  GET: 'GET',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
  PATCH: 'PATCH',
  POST: 'POST',
  PUT: 'PUT',
};

export const HTTP_METHODS_WITHOUT_PAYLOADS = [
  REQUEST_TYPES.DELETE,
  REQUEST_TYPES.GET,
  REQUEST_TYPES.HEAD,
  REQUEST_TYPES.OPTIONS,
];

export const HTTP_METHODS_WITH_PAYLOADS = [
  REQUEST_TYPES.PATCH,
  REQUEST_TYPES.POST,
  REQUEST_TYPES.PUT,
];

// Define action specific error types
export const ERROR_TYPES = {
  VALIDATION_ERROR: new ResponseModel({}, 400, 'required fields are missing'),
};

export type RequestFile = {
  type: string;
  filename: string;
  contentType: string;
  content: string | Buffer;
};

/**
 * Provides access to components of the HTTP request being handled.
 */
export default class RequestService extends DependencyAwareClass {
  /**
   * Get a parameter from the request.
   *
   * @param parameter
   * @param ifNull Value to return if the parameter is not set.
   * @param requestType
   */
  get(parameter: string, ifNull?: string | null, requestType?: string): string | string[] | null {
    const queryParameters = this.getAll(requestType);

    if (queryParameters === null) {
      return ifNull ?? null;
    }

    return queryParameters[parameter] ?? ifNull ?? null;
  }

  /**
   * Get all HTTP headers included in the request.
   *
   * Header names are converted to lowercase.
   *
   * @returns An object with a key for each header.
   */
  getAllHeaders(): Record<string, string | undefined> {
    const event = this.di.event as APIGatewayProxyEvent;
    if (!event.headers) {
      return {};
    }
    return Object.fromEntries(
      Object.entries(event.headers)
        .map(([key, value]) => [key.toLowerCase(), value]),
    );
  }

  /**
   * Get an HTTP header from the request.
   *
   * The header name is case-insensitive.
   *
   * @param name The name of the header.
   * @param [whenMissing] Value to return if the header is missing.
   *   (default: empty string)
   */
  getHeader(name: string, whenMissing = ''): string {
    const headers = this.getAllHeaders();
    const lowerName = name.toLowerCase();
    return headers[lowerName] ?? whenMissing;
  }

  /**
   * Get an authorization token from the `Authorization` header.
   */
  getAuthorizationToken(): string | null {
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
   * Get a path parameter, or all path parameters if no `parameter` is given.
   *
   * @param parameter
   * @param ifNull Value to return if the parameter is not set.
   */
  getPathParameter(parameter?: string, ifNull = {}): any {
    const event = this.getContainer().getEvent() as APIGatewayProxyEvent;

    // If no parameter has been requested, return all path parameters
    if (!parameter && typeof event.pathParameters === 'object') {
      return event.pathParameters;
    }

    // If a specifc parameter has been requested, return the parameter if it exists
    if (
      parameter
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
   */
  getAll(requestType?: string): any {
    const event = this.getContainer().getEvent() as APIGatewayProxyEvent;

    if (
      HTTP_METHODS_WITHOUT_PAYLOADS.includes(event.httpMethod)
      || HTTP_METHODS_WITHOUT_PAYLOADS.includes(requestType || '')
    ) {
      // get simple parameters
      const params: Record<string, string | string[] | undefined> = {
        ...event.queryStringParameters,
      };
      // add array parameters as arrays
      if (event.multiValueQueryStringParameters !== null) {
        Object.keys(params)
          .filter((key) => key.endsWith('[]'))
          .forEach((key) => {
            params[key] = event.multiValueQueryStringParameters?.[key];
          });
      }
      return params;
    }

    if (
      HTTP_METHODS_WITH_PAYLOADS.includes(event.httpMethod)
      || HTTP_METHODS_WITH_PAYLOADS.includes(requestType || '')
    ) {
      const contentType = this.getHeader('Content-Type');
      let queryParameters = {};

      if (contentType.includes('application/x-www-form-urlencoded')) {
        queryParameters = QueryString.parse(event.body as string);
      }

      if (contentType.includes('application/json')) {
        try {
          queryParameters = JSON.parse(event.body as string);
        } catch {
          queryParameters = {};
        }
      }

      if (contentType.includes('text/xml')) {
        XML2JS.parseString(event.body as string, (error, result) => {
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
   */
  getIp(): string | null {
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
   * Get user agent details from the `User-Agent` header.
   */
  getUserBrowserAndDevice() {
    const userAgent = this.getHeader('user-agent');
    if (!userAgent) {
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
      this.di.get(LoggerService).label('user-agent-parsing-failed');
      return null;
    }
  }

  /**
   * Test a request against validation constraints.
   *
   * See [validate.js](https://validatejs.org/) for how to write constraints.
   *
   * @param constraints
   */
  validateAgainstConstraints(constraints: object): Promise<void> {
    const logger = this.di.get(LoggerService);

    return new Promise((resolve, reject) => {
      const validation = validate(this.getAll(), constraints);

      if (typeof validation === 'undefined') {
        resolve();
      } else {
        logger.label('request-validation-failed');
        const validationErrorResponse = ERROR_TYPES.VALIDATION_ERROR;
        validationErrorResponse.setBodyVariable('validation_errors', validation);
        reject(validationErrorResponse);
      }
    });
  }

  /**
   * Fetch the request multipart form.
   *
   * @param useBuffer Whether to return file content as a `Buffer`.
   */
  parseForm(useBuffer: boolean) {
    // todo: rewrite this to use a dedicated package and add error handling
    /* eslint-disable @typescript-eslint/no-non-null-assertion */

    const event = this.getContainer().getEvent() as APIGatewayProxyEvent;
    const boundary = RequestService.getBoundary(event) as string;

    const body = event.isBase64Encoded
      ? Buffer.from(event.body as string, 'base64').toString('binary').trim()
      : event.body as string;

    const result: Record<string, RequestFile | string> = {};
    body.split(boundary).forEach((item) => {
      if (/filename=".+"/g.test(item)) {
        const name = item.match(/name=".+";/g)![0].slice(6, -2);
        result[name] = {
          type: 'file',
          filename: item.match(/filename=".+"/g)![0].slice(10, -1),
          contentType: item.match(/Content-Type:\s.+/g)![0].slice(14),
          content: useBuffer
            ? Buffer.from(item.slice(item.search(/Content-Type:\s.+/g) + item.match(/Content-Type:\s.+/g)![0].length + 4, -4), 'binary')
            : item.slice(item.search(/Content-Type:\s.+/g) + item.match(/Content-Type:\s.+/g)![0].length + 4, -4),
        };
      } else if (/name=".+"/g.test(item)) {
        result[item.match(/name=".+"/g)![0].slice(6, -1)] = item.slice(item.search(/name=".+"/g) + item.match(/name=".+"/g)![0].length + 4, -4);
      }
    });

    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    return result;
  }

  /**
   * Fetch the request AWS event Records
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
   * Gets a value independently from the case of the key.
   *
   * @param object
   * @param key
   */
  static getValueIgnoringKeyCase(object: Record<string, string | undefined>, key: string): string | undefined {
    const foundKey = Object.keys(object)
      .find((currentKey) => currentKey.toLocaleLowerCase() === key.toLowerCase());
    return foundKey && object[foundKey];
  }

  /**
   * Returns the content type
   * assoiated with the request
   *
   * @param event
   */
  static getBoundary(event: APIGatewayProxyEvent): string | undefined {
    return this.getValueIgnoringKeyCase(event.headers, 'Content-Type')?.split('=')?.[1];
  }
}
