import { S3 } from 'aws-sdk';

import DependencyInjection from '../../../src/DependencyInjection/DependencyInjection.class';
import BaseConfigService, { S3_NO_SUCH_KEY_ERROR_CODE, ServiceStates, ServiceStatesHttpCodes } from '../../../src/Service/BaseConfig.service';

const createAsyncMock = (returnValue) => {
  const mockedValue = returnValue instanceof Error
    ? Promise.reject(returnValue)
    : Promise.resolve(returnValue);

  return jest.fn().mockReturnValue({ promise: () => mockedValue });
};

/**
 * Generates a BaseConfigService
 * @param {*} param0
 * @returns {BaseConfigService}
 */
const getService = ({ getObject = null, putObject = null, deleteObject = null } = {}) => {
  const di = new DependencyInjection({}, {}, {});
  const service = new BaseConfigService(di);
  const client = {
    getObject: createAsyncMock(getObject),
    putObject: createAsyncMock(putObject),
    deleteObject: createAsyncMock(deleteObject),
  };

  jest.spyOn(service, 'client', 'get').mockReturnValue(client);

  return service;
};

const BaseConfigUnitTests = (serviceGenerator: (...args) => BaseConfigService) => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('defaultConfig', () => {
    it('is a valid object', () => {
      const service = serviceGenerator();
      const isValidObject = typeof service.constructor.defaultConfig === 'object' && service.constructor.defaultConfig !== null;

      expect(isValidObject).toEqual(true);
    });

    it('has state defined', () => {
      const service = serviceGenerator();
      const defaultConfig = service.constructor.defaultConfig;

      expect('state' in defaultConfig).toEqual(true);
    });
  });

  describe('s3config', () => {
    it('is a valid object', () => {
      const service = serviceGenerator();
      const isValidObject = typeof service.constructor.s3config === 'object' && service.constructor.s3config !== null;

      expect(isValidObject).toEqual(true);
    });

    it('has Bucket and Key defined', () => {
      const service = serviceGenerator();
      const s3config = service.constructor.s3config;

      expect('Bucket' in s3config).toEqual(true);
      expect('Key' in s3config).toEqual(true);
    });
  });

  describe('delete', () => {
    it('calls client.deleteObject', async () => {
      const service = serviceGenerator();
      await service.delete();

      expect(service.client.deleteObject).toHaveBeenCalledTimes(1);
    });
  });

  describe('put', () => {
    it('calls client.putObject', async () => {
      const expected = Symbol('put');
      const service = serviceGenerator();
      await service.put(expected);

      expect(service.client.putObject).toHaveBeenCalledTimes(1);
    });

    it('returns the provided config unchanged', async () => {
      const expected = Symbol('put');
      const service = serviceGenerator();
      const config = await service.put(expected);

      expect(config).toEqual(expected);
    });
  });

  describe('get', () => {
    it('gets an existing config', async () => {
      const expected = { a: 1 };
      const service = serviceGenerator({ getObject: { Body: JSON.stringify(expected) } });
      const config = await service.get();

      expect(config).toEqual(expected);
    });

    it('refuses empty configurations', async () => {
      const service = serviceGenerator({ getObject: { Body: '' } });

      await expect(service.get()).rejects.toThrowErrorMatchingSnapshot();
    });

    it('refuses invalid configurations', async () => {
      const service = serviceGenerator({ getObject: { Body: '{ "a": 1' } });

      await expect(service.get()).rejects.toThrowErrorMatchingSnapshot();
    });

    it('propagates the 404', async () => {
      const error = new Error('404');
      error.code = S3_NO_SUCH_KEY_ERROR_CODE;

      const service = serviceGenerator({ getObject: error });

      await expect(service.get()).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('getOrCreate', () => {
    it('uploads the defaultConfig with a 404 error', async () => {
      const error = new Error('404');
      error.code = S3_NO_SUCH_KEY_ERROR_CODE;

      const service = serviceGenerator({ getObject: error });
      const config = await service.getOrCreate();

      expect(config).toEqual(service.constructor.defaultConfig);
    });

    it('throws any non-404 error', async () => {
      const error = new Error('Bad error');
      error.code = 'another';

      const service = serviceGenerator({ getObject: error });

      await expect(service.getOrCreate()).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('patch', () => {
    it('uses the existing config if an existing config is found', async () => {
      const existing = { a: 1 };
      const service = serviceGenerator({ getObject: { Body: JSON.stringify(existing) } });

      const additional = { b: 2 };
      const expected = { ...existing, ...additional };
      const config = await service.patch(additional);

      expect(config).toEqual(expected);
    });

    it('uses the base config if no existing config is found', async () => {
      const error = new Error('404');
      error.code = S3_NO_SUCH_KEY_ERROR_CODE;
      const service = serviceGenerator({ getObject: error });

      const existing = service.constructor.defaultConfig;
      const additional = { b: 2 };
      const expected = { ...existing, ...additional };
      const config = await service.patch(additional);

      expect(config).toEqual(expected);
    });

    it('throws any non-404 error', async () => {
      const error = new Error('Bad error');
      error.code = 'another';

      const service = serviceGenerator({ getObject: error });

      await expect(service.patch({ b: 1 })).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('healthCheck', () => {
    Object.values(ServiceStates).forEach((state) => {
      describe(state, () => {
        it('Returns the expected HTTP code with the given config', async () => {
          const config = { state };
          const service = serviceGenerator();
          const statusCode = await service.healthCheck(config);
          const expected = ServiceStatesHttpCodes[state];

          expect(statusCode).toEqual(expected);
        });

        it('Returns the expected HTTP code with the existing config', async () => {
          const config = { state };
          const service = serviceGenerator({ getObject: { Body: JSON.stringify(config) } });
          const statusCode = await service.healthCheck();
          const expected = ServiceStatesHttpCodes[state];

          expect(statusCode).toEqual(expected);
        });
      });
    });

    describe('Unknown state', () => {
      it('Returns 500 with the given config', async () => {
        const config = { state: 'Unknown' };
        const service = serviceGenerator();
        const statusCode = await service.healthCheck(config);
        const expected = 500;

        expect(statusCode).toEqual(expected);
      });

      it('Returns 500 with the existing config', async () => {
        const config = { state: 'Unknown' };
        const service = serviceGenerator({ getObject: { Body: JSON.stringify(config) } });
        const statusCode = await service.healthCheck();
        const expected = 500;

        expect(statusCode).toEqual(expected);
      });
    });
  });

  describe('ensureHealthy', () => {
    [200, 201, 202, 204, 300, 301, 399].forEach((statusCode) => {
      describe(statusCode, () => {
        it('is healthy', async () => {
          const service = serviceGenerator();
          jest.spyOn(service, 'healthCheck').mockImplementation(() => Promise.resolve(statusCode));

          await expect(service.ensureHealthy()).resolves.toEqual(statusCode);
        });
      });
    });

    [400, 401, 403, 404, 409, 499, 500, 501, 502, 503, 504, 'Dante Alighieri'].forEach((statusCode) => {
      describe(statusCode, () => {
        it('throws a LambdaTermination', async () => {
          const service = serviceGenerator();
          jest.spyOn(service, 'healthCheck').mockImplementation(() => Promise.resolve(statusCode));

          await expect(service.ensureHealthy()).rejects.toThrowErrorMatchingSnapshot();
        });
      });
    });
  });
};

describe('Service/BaseConfigService', () => {
  BaseConfigUnitTests(getService);

  describe('client', () => {
    it('Returns an s3 instance (static)', () => {
      expect(BaseConfigService.client instanceof S3).toEqual(true);
    });

    it('Returns an s3 instance', () => {
      const di = new DependencyInjection({}, {}, {});
      const service = new BaseConfigService(di);

      expect(service.client instanceof S3).toEqual(true);
    });
  });
});
