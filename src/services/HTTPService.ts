import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import DependencyAwareClass from '../core/DependencyAwareClass';
import DependencyInjection from '../core/DependencyInjection';
import RequestService from './RequestService';

export const COMICRELIEF_TEST_METADATA_HEADER = 'x-comicrelief-test-metadata';
export const DEFAULT_HTTP_TIMEOUT = 10 * 1000;

/**
 * Wrapper for `axios.request` that:
 *
 * - sets a default timeout of 10 seconds
 * - forwards a `x-comicrelief-test-metadata` header if one was provided in
 *   the request from upstream
 */
export default class HTTPService extends DependencyAwareClass {
  config: AxiosRequestConfig;

  constructor(di: DependencyInjection) {
    super(di);

    this.config = {
      timeout: DEFAULT_HTTP_TIMEOUT,
    };
  }

  /**
   * Set the default timeout.
   *
   * @param ms
   */
  setDefaultTimeout(ms: number) {
    this.config.timeout = ms;
  }

  /**
   * Perform an HTTP request.
   *
   * @param config
   */
  async request(config: AxiosRequestConfig): Promise<AxiosResponse> {
    const mergedConfig = {
      timeout: this.config.timeout,
      headers: {},
      ...config,
    };

    const request = this.di.get(RequestService);
    const testMetadata = request.getHeader(COMICRELIEF_TEST_METADATA_HEADER);

    if (testMetadata) {
      mergedConfig.headers = mergedConfig.headers || {};
      mergedConfig.headers[COMICRELIEF_TEST_METADATA_HEADER] = testMetadata;
    }

    return axios.request(mergedConfig);
  }
}
