import axios from 'axios';

import {
  COMICRELIEF_TEST_METADATA_HEADER,
  Context,
  DependencyInjection,
  HTTPService,
  RequestService,
} from '@/src';
import mockEvent from '@/tests/mocks/aws/event.json';

const mockContext = { invokedFunctionArn: 'my-function' } as Context;

const getService = (event = mockEvent, context = mockContext) => {
  const di = new DependencyInjection({
    dependencies: {
      HTTPService,
      RequestService,
    },
  }, event, context);
  return di.get(HTTPService);
};

describe('unit.services.HTTPService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('request', () => {
    const testCases = {
      'GET request': { method: 'GET', url: '/' },
      'POST request': { method: 'POST', url: '/' },
      'PUT request': { method: 'PUT', url: '/' },
      'PATCH request': { method: 'PATCH', url: '/' },
      'HEAD request': { method: 'HEAD', url: '/' },
      'DELETE request': { method: 'DELETE', url: '/' },
      'with URL': { url: '/some/nested/path' },
      'with baseURL': { baseUrl: 'https://comicrelief.com/test', url: '/additional/url' },
      'overriding timeout': { timeout: 99 },
      'with headers': { headers: { Authorization: 'Bearer test' } },
      'with undefined headers': { headers: undefined },
    };

    Object.entries(testCases).forEach(([description, config]) => {
      it(description, async () => {
        const expected = { response: {} };
        const mock = jest.spyOn(axios, 'request').mockResolvedValue(expected);
        const service = getService();

        const response = await service.request(config);

        expect(response).toEqual(expected);
        expect(mock.mock.calls).toMatchSnapshot('config');
      });

      it(`adds the test header, ${description}`, async () => {
        const metadata = JSON.stringify({ user: 'Dante Alighieri' });
        const event = {
          ...mockEvent,
          headers: {
            ...mockEvent.headers,
            [COMICRELIEF_TEST_METADATA_HEADER]: metadata,
          },
        };
        const expected = { response: {} };
        const mock = jest.spyOn(axios, 'request').mockResolvedValue(expected);
        const service = getService(event);

        const response = await service.request(config);

        expect(response).toEqual(expected);
        expect(mock.mock.calls).toMatchSnapshot('config');
      });
    });
  });
});
