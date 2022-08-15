import axios from 'axios';

import CONFIGURATION from '../../../src/Config/Dependencies';
import DependencyInjection from '../../../src/DependencyInjection/DependencyInjection.class';
import HTTPService, { COMICRELIEF_TEST_METADATA_HEADER } from '../../../src/Service/HTTP.service';
import getEvent from '../../mocks/aws/event.json';

const getContext = { invokedFunctionArn: 'my-function' };

const getService = (event = getEvent, context = getContext) => new HTTPService(new DependencyInjection(CONFIGURATION, event, context));

describe('Service/HTTPService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('request', () => {
    const testCases = {
      'GET Request': { method: 'GET', url: '/' },
      'POST Request': { method: 'POST', url: '/' },
      'PUT Request': { method: 'PUT', url: '/' },
      'PATCH Request': { method: 'PATCH', url: '/' },
      'HEAD Request': { method: 'HEAD', url: '/' },
      'DELETE Request': { method: 'DELETE', url: '/' },
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
          ...getEvent,
          headers: {
            ...getEvent.headers,
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
