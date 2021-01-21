/* eslint-disable sonarjs/no-duplicate-string */
import QueryString from 'querystring';

import CONFIGURATION from '../../../src/Config/Dependencies';
import DependencyInjection from '../../../src/DependencyInjection/DependencyInjection.class';
import RequestService, { HTTP_METHODS_WITHOUT_PAYLOADS, HTTP_METHODS_WITH_PAYLOADS } from '../../../src/Service/Request.service';

const getContext = require('../../mocks/aws/context.json');
const baseEvent = require('../../mocks/aws/event.json');

const getEvent = (overrides = {}) => JSON.parse(JSON.stringify(({
  ...baseEvent,
  ...overrides,
})));

describe('Service/RequestService', () => {
  afterEach(() => jest.resetAllMocks());

  HTTP_METHODS_WITHOUT_PAYLOADS.forEach((httpMethod) => {
    describe(`HTTP ${httpMethod}`, () => {
      describe('.getAll', () => {
        it('should return all get parameters as an array', () => {
          const event = getEvent({ httpMethod });
          event.queryStringParameters.test = 123;
          const request = new RequestService(new DependencyInjection(CONFIGURATION, event, getContext));

          expect(request.getAll()).toEqual(event.queryStringParameters);
        });
      });

      describe('.get', () => {
        it('should fetch a query parameter from an AWS event', () => {
          const event = getEvent({ httpMethod });
          event.queryStringParameters.test = 123;
          const request = new RequestService(new DependencyInjection(CONFIGURATION, event, getContext));

          expect(request.get('test')).toEqual(event.queryStringParameters.test);
        });

        it('should fetch a query parameter from an AWS event when the request type is set', () => {
          const event = getEvent({ httpMethod });
          event.queryStringParameters.test = 123;
          const request = new RequestService(new DependencyInjection(CONFIGURATION, event, getContext));

          expect(request.get('test', null, httpMethod)).toEqual(event.queryStringParameters.test);
        });

        it(`should return null from a non existent ${httpMethod} parameter from an AWS event`, () => {
          const event = getEvent({ httpMethod });
          const request = new RequestService(new DependencyInjection(CONFIGURATION, event, getContext));

          expect(request.get('fake')).toEqual(null);
        });

        it(`should return null from a non existent ${httpMethod} parameter from an AWS event when the request type is set`, () => {
          const event = getEvent({ httpMethod });
          const request = new RequestService(new DependencyInjection(CONFIGURATION, event, getContext));

          expect(request.get('fake', null, httpMethod)).toEqual(null);
        });
      });

      describe('.validateAgainstConstraints', () => {
        const constraints = {
          giftaid: {
            numericality: true,
          },
        };

        beforeEach(() => {
          // Mute Winston
          // eslint-disable-next-line no-underscore-dangle
          jest.spyOn(console._stdout, 'write').mockImplementation(() => {});
        });

        it('should resolve if there are no validation errors', async () => {
          const event = getEvent({ httpMethod });
          event.queryStringParameters.giftaid = 123;
          const request = new RequestService(new DependencyInjection(CONFIGURATION, event, getContext));

          await expect(request.validateAgainstConstraints(constraints)).resolves.toEqual(undefined);
        });

        it('should return a response containing validation errors if the data provided is incorrect', async () => {
          const event = getEvent({ httpMethod });
          event.queryStringParameters.giftaid = 'abc';
          const request = new RequestService(new DependencyInjection(CONFIGURATION, event, getContext));

          await expect(request.validateAgainstConstraints(constraints)).rejects.toMatchSnapshot();
        });
      });

      describe('.getUserBrowserAndDevice', () => {
        it('should return null with `headers === undefined`', () => {
          const event = getEvent({ httpMethod, headers: undefined });
          const request = new RequestService(new DependencyInjection(CONFIGURATION, event, getContext));

          expect(request.getUserBrowserAndDevice()).toEqual(null);
        });

        it('should return null with `headers === null`', () => {
          const event = getEvent({ httpMethod, headers: null });
          const request = new RequestService(new DependencyInjection(CONFIGURATION, event, getContext));

          expect(request.getUserBrowserAndDevice()).toEqual(null);
        });

        it('should return a prettified user agent', () => {
          const event = getEvent({ httpMethod });
          const request = new RequestService(new DependencyInjection(CONFIGURATION, event, getContext));
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
      describe('.getAll', () => {
        it('should return all post parameters as an array', () => {
          const event = getPayloadEvent();
          const request = new RequestService(new DependencyInjection(CONFIGURATION, event, getContext));

          expect(request.getAll()).toEqual(queryParameters);
        });
      });

      describe('.get', () => {
        it('should fetch a request body parameter from an AWS event', () => {
          const event = getPayloadEvent();
          const request = new RequestService(new DependencyInjection(CONFIGURATION, event, getContext));

          expect(request.get('grant_type')).toEqual(queryParameters.grant_type);
        });

        it('should fetch a request body parameter from an AWS event when the request type is set', () => {
          const event = getPayloadEvent();
          const request = new RequestService(new DependencyInjection(CONFIGURATION, event, getContext));

          expect(request.get('grant_type', null, httpMethod)).toEqual(queryParameters.grant_type);
        });

        it('should return null from a non existent request body parameter from an AWS event', () => {
          const event = getPayloadEvent();
          const request = new RequestService(new DependencyInjection(CONFIGURATION, event, getContext));

          expect(request.get('fake')).toEqual(null);
        });

        it('should return null from a non existent request body parameter from an AWS event when the request type is set', () => {
          const event = getPayloadEvent();
          const request = new RequestService(new DependencyInjection(CONFIGURATION, event, getContext), getEvent);

          expect(request.get('fake', null, httpMethod)).toEqual(null);
        });
      });

      describe('.validateAgainstConstraints', () => {
        const constraints = {
          giftaid: {
            numericality: true,
          },
        };

        beforeEach(() => {
          // Mute Winston
          // eslint-disable-next-line no-underscore-dangle
          jest.spyOn(console._stdout, 'write').mockImplementation(() => {});
        });

        it('should resolve if there are no validation errors', async () => {
          const event = getPayloadEvent({ body: 'giftaid=123' });
          const request = new RequestService(new DependencyInjection(CONFIGURATION, event, getContext));

          await expect(request.validateAgainstConstraints(constraints)).resolves.toEqual(undefined);
        });

        it('should return a response containing validation errors if the data provided is incorrect', async () => {
          const event = getPayloadEvent({ body: 'giftaid=abc' });
          const request = new RequestService(new DependencyInjection(CONFIGURATION, event, getContext));

          await expect(request.validateAgainstConstraints(constraints)).rejects.toMatchSnapshot();
        });
      });
    });
  });

  describe('getAllHeaders()', () => {
    const event = getEvent();
    const di = new DependencyInjection(CONFIGURATION, event, getContext);
    const request = new RequestService(di);

    it('should return all headers from the event', () => {
      expect(request.getAllHeaders()).toStrictEqual(event.headers);
    });
  });

  describe('getHeader()', () => {
    const event = getEvent();
    const di = new DependencyInjection(CONFIGURATION, event, getContext);
    const request = new RequestService(di);

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
