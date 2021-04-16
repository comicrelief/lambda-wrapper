import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import DependencyAwareClass from '../DependencyInjection/DependencyAware.class';

export const COMICRELIEF_TEST_METADATA_HEADER = 'x-comicrelief-test-metadata';
export const DEFAULT_HTTP_TIMEOUT = 10 * 1000;

/**
 * HTTPService class
 */
export default class HTTPService extends DependencyAwareClass {
  constructor(di) {
    super(di);

    this.config = {
      timeout: DEFAULT_HTTP_TIMEOUT,
    };
  }

  /**
   * Sets the default timeout
   *
   * @param {number} ms
   */
  setDefaultTimeout(ms) {
    this.config.timeout = ms;
  }

  /**
   * Performs and HTTP Request
   *
   * @param config
   */
  async request(config: AxiosRequestConfig): Promise<AxiosResponse> {
    const mergedConfig = {
      timeout: this.config.timeout,
      headers: {},
      ...config,
    };

    const event = this.getContainer().get(this.definitions.REQUEST);
    const testMetadata = event.getHeader(COMICRELIEF_TEST_METADATA_HEADER);

    if (testMetadata) {
      mergedConfig.headers[COMICRELIEF_TEST_METADATA_HEADER] = testMetadata;
    }

    return axios.request(mergedConfig);
  }
}
