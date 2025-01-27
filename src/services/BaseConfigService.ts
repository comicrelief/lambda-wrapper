import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import DependencyAwareClass from '../core/DependencyAwareClass';
import LambdaTermination from '../utils/LambdaTermination';

/**
 * `error.Code` for S3 404 errors.
 */
export const S3_NO_SUCH_KEY_ERROR_CODE = 'NoSuchKey';

/**
 * Represents the service states.
 */
export const ServiceStates = {
  OK: 'OK',
  TEMPORARILY_PAUSED: 'TEMPORARILY_PAUSED',
  INDEFINITELY_PAUSED: 'INDEFINITELY_PAUSED',
};

/**
 * Maps service states to HTTP codes.
 */
export const ServiceStatesHttpCodes = {
  [ServiceStates.OK]: 200,
  [ServiceStates.TEMPORARILY_PAUSED]: 409,
  [ServiceStates.INDEFINITELY_PAUSED]: 409,
};

/**
 * This class is to be extended by the implementing services so that
 * `defaultConfig` and possibly `s3Config` can be overriden / extended.
 *
 * Config is typed as `unknown` since you shouldn't trust what's in the bucket.
 * Override the `get` and `put` methods to pass the results through some
 * validation to ensure the config is valid and can safely be typed.
 */
export default class BaseConfigService extends DependencyAwareClass {
  /**
   * Returns the basic config.
   *
   * This getter is used to set the default config should the service not find
   * any on the configured S3 Bucket.
   *
   * See `getOrCreate` and `patch` methods.
   */
  static get defaultConfig() {
    return {
      state: ServiceStates.OK,
    };
  }

  /**
   * Returns the S3 configuration used to retrieve or update the service
   * configuration.
   */
  static get s3config(): { Bucket: string; Key: string; } {
    return {
      Bucket: process.env.SERVICE_CONFIG_S3_BUCKET || '',
      Key: process.env.SERVICE_CONFIG_S3_KEY || '',
    };
  }

  /**
   * Returns an S3 client.
   */
  static get client() {
    return new S3Client({
      region: process.env.REGION,
    });
  }

  /**
   * Returns an S3 client
   */
  get client() {
    return (this.constructor as typeof BaseConfigService).client;
  }

  /**
   * Deletes the configuration stored on S3. Helpful in feature tests.
   */
  async delete() {
    return this.client.send(new DeleteObjectCommand(
      (this.constructor as typeof BaseConfigService).s3config,
    ));
  }

  /**
   * Puts the given configuration on S3.
   *
   * @param config
   */
  async put<T>(config: T): Promise<T> {
    await this.client.send(new PutObjectCommand({
      ...(this.constructor as typeof BaseConfigService).s3config,
      Body: JSON.stringify(config),
    }));

    return config;
  }

  /**
   * Gets the service configuration.
   */
  async get(): Promise<unknown> {
    const response = await this.client.send(new GetObjectCommand(
      (this.constructor as typeof BaseConfigService).s3config,
    ));
    const body = await response.Body?.transformToString();

    if (!body) {
      // Empty strings are not valid configurations
      throw new Error('Configuration file is empty');
    }

    try {
      return JSON.parse(body);
    } catch {
      throw new Error('Invalid configuration file');
    }
  }

  /**
   * Gets or creates the service configuration.
   *
   * If the configuration is not found on S3 the default configuration is
   * uploaded and returned instead.
   */
  async getOrCreate(): Promise<unknown> {
    try {
      return await this.get();
    } catch (error: any) {
      if (error.Code !== S3_NO_SUCH_KEY_ERROR_CODE) {
        // Throw directly any other error
        throw error;
      }

      return this.put((this.constructor as typeof BaseConfigService).defaultConfig);
    }
  }

  /**
   * Patches the existing configuration
   * or the default configuration
   * with the provided partial configuration
   *
   * @param partialConfig
   */
  async patch(partialConfig: any): Promise<unknown> {
    let base: any = (this.constructor as typeof BaseConfigService).defaultConfig;

    try {
      base = await this.get();
    } catch (error: any) {
      if (error.Code !== S3_NO_SUCH_KEY_ERROR_CODE) {
        // Throw directly any other error
        throw error;
      }

      // Config doesn't exist
      // keep using `this.constructor.defaultConfig`
    }

    return this.put({
      ...base,
      ...partialConfig,
    });
  }

  /**
   * Performs a health check given the current config.
   *
   * If `currentConfig` is not supplied it uses `getOrCreate` to fetch it.
   *
   * @param currentConfig
   */
  async healthCheck(currentConfig?: any): Promise<number> {
    const config = currentConfig || await this.getOrCreate();

    return ServiceStatesHttpCodes[config.state] || 500;
  }

  /**
   * Ensures that the application is healthy or throws a `LambdaTermination`.
   *
   * @param currentConfig
   */
  async ensureHealthy(currentConfig: any = null) {
    const statusCode = await this.healthCheck(currentConfig);

    if (statusCode < 400) {
      return statusCode;
    }

    const message = 'Application is not healthy.';

    throw new LambdaTermination(message, statusCode, message, message);
  }
}
