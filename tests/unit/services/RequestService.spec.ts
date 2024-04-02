import QueryString from 'querystring';

import {
  HTTP_METHODS_WITHOUT_PAYLOADS,
  HTTP_METHODS_WITH_PAYLOADS,
} from '@/src/services/RequestService';

import {
  DependencyInjection,
  LoggerService,
  RequestService,
} from '@/src';
import { mockContext, mockEvent } from '@/tests/mocks/aws';

const getEvent = (overrides = {}) => JSON.parse(JSON.stringify(({
  ...mockEvent,
  ...overrides,
})));

const getRequestService = (event: any) => {
  const di = new DependencyInjection({
    dependencies: {
      RequestService,
      LoggerService,
    },
  }, event, mockContext);
  return new RequestService(di);
};

describe('unit.services.RequestService', () => {
  beforeAll(() => {
    // mute log ouptut
    const noop = () => { /* do nothing */ };
    jest.spyOn(LoggerService.prototype, 'info').mockImplementation(noop);
    jest.spyOn(LoggerService.prototype, 'error').mockImplementation(noop);
    jest.spyOn(LoggerService.prototype, 'metric').mockImplementation(noop);
    jest.spyOn(LoggerService.prototype, 'label').mockImplementation(noop);
  });

  afterEach(() => jest.resetAllMocks());

  HTTP_METHODS_WITHOUT_PAYLOADS.forEach((httpMethod) => {
    describe(`HTTP ${httpMethod}`, () => {
      describe('getAll', () => {
        it('should return all query string parameters as an object', () => {
          const event = getEvent({ httpMethod });
          event.queryStringParameters.test = '123';
          const request = getRequestService(event);

          const params = request.getAll();
          expect(params.test).toEqual('123');
          expect(params['array[]']).toEqual(['one', 'two', 'three']);
        });
      });

      describe('get', () => {
        it('should fetch a query parameter', () => {
          const event = getEvent({ httpMethod });
          event.queryStringParameters.test = '123';
          const request = getRequestService(event);

          expect(request.get('test')).toEqual('123');
        });

        it('should fetch a query parameter when the request type is given', () => {
          const event = getEvent({ httpMethod });
          event.queryStringParameters.test = 123;
          const request = getRequestService(event);

          const param = request.get('test', null, httpMethod);
          expect(param).toEqual(event.queryStringParameters.test);
        });

        it(`should return null from a nonexistent ${httpMethod} parameter`, () => {
          const event = getEvent({ httpMethod });
          const request = getRequestService(event);

          const param = request.get('fake');
          expect(param).toBeNull();
        });

        it(`should return null from a nonexistent ${httpMethod} parameter when the request type is given`, () => {
          const event = getEvent({ httpMethod });
          const request = getRequestService(event);

          const param = request.get('fake', null, httpMethod);
          expect(param).toBeNull();
        });

        it('should return an array-type query parameter if its name ends []', () => {
          const event = getEvent({ httpMethod });
          const request = getRequestService(event);

          const param = request.get('array[]');
          expect(param).toEqual(['one', 'two', 'three']);
        });
      });

      describe('validateAgainstConstraints', () => {
        const constraints = {
          giftaid: {
            numericality: true,
          },
        };

        it('should resolve if there are no validation errors', async () => {
          const event = getEvent({ httpMethod });
          event.queryStringParameters.giftaid = 123;
          const request = getRequestService(event);

          await expect(request.validateAgainstConstraints(constraints)).resolves.toEqual(undefined);
        });

        it('should return a response containing validation errors if the data provided is incorrect', async () => {
          const event = getEvent({ httpMethod });
          event.queryStringParameters.giftaid = 'abc';
          const request = getRequestService(event);

          await expect(request.validateAgainstConstraints(constraints)).rejects.toMatchSnapshot();
        });
      });

      describe('getUserBrowserAndDevice', () => {
        it('should return null with `headers === undefined`', () => {
          const event = getEvent({ httpMethod, headers: undefined });
          const request = getRequestService(event);

          expect(request.getUserBrowserAndDevice()).toEqual(null);
        });

        it('should return null with `headers === null`', () => {
          const event = getEvent({ httpMethod, headers: null });
          const request = getRequestService(event);

          expect(request.getUserBrowserAndDevice()).toEqual(null);
        });

        it('should return a prettified user agent', () => {
          const event = getEvent({ httpMethod });
          const request = getRequestService(event);

          expect(request.getUserBrowserAndDevice()).toEqual({
            'browser-type': 'Safari',
            'browser-version': '9.1.1',
            'device-type': 'Other',
            'operating-system': 'Mac OS X',
            'operating-system-version': '10.11.5',
          });
        });
      });
    });
  });

  HTTP_METHODS_WITH_PAYLOADS.forEach((httpMethod) => {
    const getPayloadEvent = (overrides = {}) => {
      const event = getEvent({ httpMethod });
      event.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      event.body = 'grant_type=client_credentials&response_type=token&token_format=opaque';
      return { ...event, ...overrides };
    };

    const queryParameters = QueryString.parse(getPayloadEvent().body);

    describe(`HTTP ${httpMethod}`, () => {
      describe('getAll', () => {
        it('should return all post parameters as an array', () => {
          const event = getPayloadEvent();
          const request = getRequestService(event);

          expect(request.getAll()).toEqual(queryParameters);
        });
      });

      describe('get', () => {
        it('should fetch a request body parameter from an AWS event', () => {
          const event = getPayloadEvent();
          const request = getRequestService(event);

          expect(request.get('grant_type')).toEqual(queryParameters.grant_type);
        });

        it('should fetch a request body parameter from an AWS event when the request type is set', () => {
          const event = getPayloadEvent();
          const request = getRequestService(event);

          expect(request.get('grant_type', null, httpMethod)).toEqual(queryParameters.grant_type);
        });

        it('should return null from a non existent request body parameter from an AWS event', () => {
          const event = getPayloadEvent();
          const request = getRequestService(event);

          expect(request.get('fake')).toEqual(null);
        });

        it('should return null from a non existent request body parameter from an AWS event when the request type is set', () => {
          const event = getPayloadEvent();
          const request = getRequestService(event);

          expect(request.get('fake', null, httpMethod)).toEqual(null);
        });
      });

      describe('validateAgainstConstraints', () => {
        const constraints = {
          giftaid: {
            numericality: true,
          },
        };

        it('should resolve if there are no validation errors', async () => {
          const event = getPayloadEvent({ body: 'giftaid=123' });
          const request = getRequestService(event);

          await expect(request.validateAgainstConstraints(constraints)).resolves.toEqual(undefined);
        });

        it('should return a response containing validation errors if the data provided is incorrect', async () => {
          const event = getPayloadEvent({ body: 'giftaid=abc' });
          const request = getRequestService(event);

          await expect(request.validateAgainstConstraints(constraints)).rejects.toMatchSnapshot();
        });
      });
    });
  });

  describe('getAllHeaders', () => {
    const event = getEvent();
    const request = getRequestService(event);

    it('should return all headers from the event', () => {
      const result = request.getAllHeaders();
      expect(result).toEqual({
        /* eslint-disable quote-props */
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-encoding': 'gzip, deflate',
        'accept-language': 'en-us',
        'cloudfront-forwarded-proto': 'https',
        'cloudfront-is-desktop-viewer': 'true',
        'cloudfront-is-mobile-viewer': 'false',
        'cloudfront-is-smarttv-viewer': 'false',
        'cloudfront-is-tablet-viewer': 'false',
        'cloudfront-viewer-country': 'US',
        'cookie': '__gads=ID=d51d609e5753330d:T=1443694116:S=ALNI_MbjWKzLwdEpWZ5wR5WXRI2dtjIpHw; __qca=P0-179798513-1443694132017; _ga=GA1.2.344061584.1441769647',
        'host': 'xxx.execute-api.us-east-1.amazonaws.com',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/601.6.17 (KHTML, like Gecko) Version/9.1.1 Safari/601.6.17',
        'via': '1.1 c8a5bb0e20655459eaam174e5c41443b.cloudfront.net (CloudFront)',
        'x-amz-cf-id': 'z7Ds7oXaY8hgUn7lcedZjoIoxyvnzF6ycVzBdQmhn3QnOPEjJz4BrQ==',
        'x-forwarded-for': '221.24.103.21, 54.242.148.216',
        'x-forwarded-port': '443',
        'x-forwarded-proto': 'https',
        /* eslint-enable quote-props */
      });
    });

    it('should convert header names to lowercase', () => {
      const result = request.getAllHeaders();
      Object.keys(result).forEach((name) => {
        expect(name).toEqual(name.toLowerCase());
      });
    });
  });

  describe('getHeader', () => {
    const event = getEvent();
    const request = getRequestService(event);

    it('should return the specified header', () => {
      expect(request.getHeader('Accept')).toEqual(event.headers.Accept);
    });

    it("should return '' by default if header is missing", () => {
      expect(request.getHeader('Authorization')).toEqual('');
    });

    it('should return `whenMissing` if header is missing', () => {
      expect(request.getHeader('Authorization', 'none')).toEqual('none');
    });

    it('should not be case-sensitive', () => {
      expect(request.getHeader('accept')).toEqual(event.headers.Accept);
    });
  });
});
