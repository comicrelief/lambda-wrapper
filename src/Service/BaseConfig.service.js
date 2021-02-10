import { S3 } from 'aws-sdk';

import DependencyAwareClass from '../DependencyInjection/DependencyAware.class';
import LambdaTermination from '../Wrapper/LambdaTermination';
/**
 * Error.code for S3 404 errors
 */
export const S3_NO_SUCH_KEY_ERROR_CODE = 'NoSuchKey';

/**
 * Represents the service states
 */
export const ServiceStates = {
  OK: 'OK',
  TEMPORARY_PAUSED: 'TEMPORARY_PAUSED',
  INDEFINITELY_PAUSED: 'UNDEFINITELY_PAUSED',
};

/**
 * Maps service states to HTTP codes
 */
export const ServiceStatesHttpCodes = {
  [ServiceStates.OK]: 200,
  [ServiceStates.TEMPORARY_PAUSED]: 409,
  [ServiceStates.INDEFINITELY_PAUSED]: 409,
};

/**
 * BaseConfigService class
 *
 * This class is to be extended by the implementing services
 * so that `defaultConfig` and possibly `s3Config` can be
 * overriden / extended.
 */
export default class BaseConfigService extends DependencyAwareClass {
  /**
   * Returns the basic config.
   * This getter is used to set the default config
   * should the service not find any
   * on the configured S3 Bucket.
   *
   * See `getOrCreate` and `patch` methods.
   */
  static get defaultConfig() {
    return {
      state: ServiceStates.OK,
    };
  }

  /**
   * Returns the S3 configuration
   * used to retrieve / update the
   * service configuration.
   */
  static get s3config() {
    return {
      Bucket: process.env.SERVICE_CONFIG_S3_BUCKET,
      Key: process.env.SERVICE_CONFIG_S3_KEY,
    };
  }

  /**
   * Returns an S3 client
   *
   * @returns {S3}
   */
  static get client() {
    return new S3({
      region: process.env.REGION,
    });
  }

  /**
   * Returns an S3 client
   *
   * @returns {S3}
   */
  get client() {
    return this.constructor.client;
  }

  /**
   * Deletes the configuration stored on S3.
   * Helpful in feature tests.
   */
  async delete() {
    return this.client.deleteObject(this.constructor.s3config).promise();
  }

  /**
   * Puts the given configuration on S3
   *
   * @param config
   */
  async put(config) {
    await this.client.putObject({
      ...this.constructor.s3config,
      Body: JSON.stringify(config),
    })
      .promise();

    return config;
  }

  /**
   * Gets the service configuration.
   */
  async get() {
    const response = await this.client.getObject(this.constructor.s3config).promise();
    const body = String(response.Body);

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
   * If the configuration is not found on S3
   * the default configuration
   * is uploaded and returned instead.
   */
  async getOrCreate() {
    try {
      return await this.get();
    } catch (error) {
      if (error.code !== S3_NO_SUCH_KEY_ERROR_CODE) {
        // Throw directly any other error
        throw error;
      }

      return this.put(this.constructor.defaultConfig);
    }
  }

  /**
   * Patches the existing configuration
   * or the default configuration
   * with the provided partial configuration
   *
   * @param partialConfig
   */
  async patch(partialConfig) {
    let base = this.constructor.defaultConfig;

    try {
      base = await this.get();
    } catch (error) {
      if (error.code !== S3_NO_SUCH_KEY_ERROR_CODE) {
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
   * Performs a health check
   * given the currentConfig.
   *
   * If currentConfig is not supplied
   * it uses `getOrCreate` to fetch it.
   *
   * @param currentConfig
   */
  async healthCheck(currentConfig = null) {
    const config = currentConfig || await this.getOrCreate();

    return ServiceStatesHttpCodes[config.state] || 500;
  }

  /**
   * Ensures that the application is healthy
   * or throws a LambdaTermination
   *
   * @param currentConfig
   */
  async ensureHealthy(currentConfig = null) {
    const statusCode = await this.healthCheck(currentConfig);

    if (statusCode < 400) {
      return statusCode;
    }

    const message = 'Application is not healthy.';

    throw new LambdaTermination(message, statusCode, message, message);
  }
}
