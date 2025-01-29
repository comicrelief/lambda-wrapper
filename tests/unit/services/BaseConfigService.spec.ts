import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import {
  S3_NO_SUCH_KEY_ERROR_CODE,
  ServiceStates,
  ServiceStatesHttpCodes,
} from '@/src/services/BaseConfigService';

import {
  BaseConfigService,
  Context,
  DependencyInjection,
} from '@/src';

type ErrorWithCode = Error & { Code?: any };

/**
 * Generate a BaseConfigService with mock S3 client.
 */
const getService = (
  {
    getObject = null,
    putObject = null,
    deleteObject = null,
  }: any = {},
): BaseConfigService & { constructor: typeof BaseConfigService; } => {
  const di = new DependencyInjection({
    dependencies: {
      BaseConfigService,
    },
  }, {}, {} as Context);

  const service = di.get(BaseConfigService);

  const client = {
    send: jest.fn().mockImplementation((command) => {
      let result;
      if (command instanceof GetObjectCommand) {
        result = getObject;
        const { Body: body } = result;
        if (typeof body === 'string') {
          result.Body = {
            transformToString: () => Promise.resolve(body),
          };
        }
      } else if (command instanceof PutObjectCommand) {
        result = putObject;
      } else if (command instanceof DeleteObjectCommand) {
        result = deleteObject;
      } else {
        throw new Error(`Unmocked S3 command: ${command.prototype.constructor.name}`);
      }
      return result instanceof Error
        ? Promise.reject(result)
        : Promise.resolve(result);
    }),
  } as unknown as S3Client;

  jest.spyOn(service, 'client', 'get').mockReturnValue(client);

  return service as any;
};

describe('unit.services.BaseConfigService', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('defaultConfig', () => {
    it('is a valid object', () => {
      const service = getService();
      const isValidObject = typeof service.constructor.defaultConfig === 'object' && service.constructor.defaultConfig !== null;

      expect(isValidObject).toEqual(true);
    });

    it('has state defined', () => {
      const service = getService();
      const defaultConfig = service.constructor.defaultConfig;

      expect('state' in defaultConfig).toEqual(true);
    });
  });

  describe('s3config', () => {
    it('is a valid object', () => {
      const service = getService();
      const isValidObject = typeof service.constructor.s3config === 'object' && service.constructor.s3config !== null;

      expect(isValidObject).toEqual(true);
    });

    it('has Bucket and Key defined', () => {
      const service = getService();
      const s3config = service.constructor.s3config;

      expect('Bucket' in s3config).toEqual(true);
      expect('Key' in s3config).toEqual(true);
    });
  });

  describe('delete', () => {
    it('calls client.deleteObject', async () => {
      const service = getService();
      await service.delete();

      expect(service.client.send).toHaveBeenCalledTimes(1);
      expect(service.client.send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
    });
  });

  describe('put', () => {
    it('calls client.putObject', async () => {
      const expected = Symbol('put');
      const service = getService();
      await service.put(expected);

      expect(service.client.send).toHaveBeenCalledTimes(1);
      expect(service.client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    });

    it('returns the provided config unchanged', async () => {
      const expected = Symbol('put');
      const service = getService();
      const config = await service.put(expected);

      expect(config).toEqual(expected);
    });
  });

  describe('get', () => {
    it('gets an existing config', async () => {
      const expected = { a: 1 };
      const service = getService({ getObject: { Body: JSON.stringify(expected) } });
      const config = await service.get();

      expect(config).toEqual(expected);
    });

    it('refuses empty configurations', async () => {
      const service = getService({ getObject: { Body: '' } });

      await expect(service.get()).rejects.toThrowErrorMatchingSnapshot();
    });

    it('refuses invalid configurations', async () => {
      const service = getService({ getObject: { Body: '{ "a": 1' } });

      await expect(service.get()).rejects.toThrowErrorMatchingSnapshot();
    });

    it('propagates the 404', async () => {
      const error: ErrorWithCode = new Error('404');
      error.Code = S3_NO_SUCH_KEY_ERROR_CODE;

      const service = getService({ getObject: error });

      await expect(service.get()).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('getOrCreate', () => {
    it('uploads the defaultConfig with a 404 error', async () => {
      const error: ErrorWithCode = new Error('404');
      error.Code = S3_NO_SUCH_KEY_ERROR_CODE;

      const service = getService({ getObject: error });
      const config = await service.getOrCreate();

      expect(config).toEqual(service.constructor.defaultConfig);
    });

    it('throws any non-404 error', async () => {
      const error: ErrorWithCode = new Error('Bad error');
      error.Code = 'another';

      const service = getService({ getObject: error });

      await expect(service.getOrCreate()).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('patch', () => {
    it('uses the existing config if an existing config is found', async () => {
      const existing = { a: 1 };
      const service = getService({ getObject: { Body: JSON.stringify(existing) } });

      const additional = { b: 2 };
      const expected = { ...existing, ...additional };
      const config = await service.patch(additional);

      expect(config).toEqual(expected);
    });

    it('uses the base config if no existing config is found', async () => {
      const error: ErrorWithCode = new Error('404');
      error.Code = S3_NO_SUCH_KEY_ERROR_CODE;
      const service = getService({ getObject: error });

      const existing = service.constructor.defaultConfig;
      const additional = { b: 2 };
      const expected = { ...existing, ...additional };
      const config = await service.patch(additional);

      expect(config).toEqual(expected);
    });

    it('throws any non-404 error', async () => {
      const error: ErrorWithCode = new Error('Bad error');
      error.Code = 'another';

      const service = getService({ getObject: error });

      await expect(service.patch({ b: 1 })).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('healthCheck', () => {
    Object.values(ServiceStates).forEach((state) => {
      describe(state, () => {
        it('returns the expected HTTP code with the given config', async () => {
          const config = { state };
          const service = getService();
          const statusCode = await service.healthCheck(config);
          const expected = ServiceStatesHttpCodes[state];

          expect(statusCode).toEqual(expected);
        });

        it('returns the expected HTTP code with the existing config', async () => {
          const config = { state };
          const service = getService({ getObject: { Body: JSON.stringify(config) } });
          const statusCode = await service.healthCheck();
          const expected = ServiceStatesHttpCodes[state];

          expect(statusCode).toEqual(expected);
        });
      });
    });

    describe('Unknown state', () => {
      it('returns 500 with the given config', async () => {
        const config = { state: 'Unknown' };
        const service = getService();
        const statusCode = await service.healthCheck(config);
        const expected = 500;

        expect(statusCode).toEqual(expected);
      });

      it('returns 500 with the existing config', async () => {
        const config = { state: 'Unknown' };
        const service = getService({ getObject: { Body: JSON.stringify(config) } });
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
          const service = getService();
          jest.spyOn(service, 'healthCheck').mockImplementation(() => Promise.resolve(statusCode));

          await expect(service.ensureHealthy()).resolves.toEqual(statusCode);
        });
      });
    });

    [400, 401, 403, 404, 409, 499, 500, 501, 502, 503, 504, 'Dante Alighieri'].forEach((statusCode) => {
      describe(statusCode, () => {
        it('throws a LambdaTermination', async () => {
          const service = getService();
          jest.spyOn(service, 'healthCheck').mockImplementation(() => Promise.resolve(statusCode as any));

          await expect(service.ensureHealthy()).rejects.toThrowErrorMatchingSnapshot();
        });
      });
    });
  });

  describe('client', () => {
    it('should return an S3 instance (static method)', () => {
      expect(BaseConfigService.client).toBeInstanceOf(S3Client);
    });

    it('should return an S3 instance (instance method)', () => {
      const di = new DependencyInjection({
        dependencies: {
          BaseConfigService,
        },
      }, {}, {} as Context);
      const service = di.get(BaseConfigService);

      expect(service.client).toBeInstanceOf(S3Client);
    });
  });
});
