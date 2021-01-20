import { S3 } from 'aws-sdk';

import DependencyAwareClass from '../DependencyInjection/DependencyAware.class';

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
   * Puts the given configuration on S3
   *
   * @param config
   */
  async put(config) {
    await this.client.putObject({
      ...this.constructor.s3config,
      Body: JSON.stringify(config),
    });

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
}
