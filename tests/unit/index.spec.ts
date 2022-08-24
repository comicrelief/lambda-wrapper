import DependencyAwareClass from '@/src/core/DependencyAwareClass';
import DependencyInjection from '@/src/core/DependencyInjection';
import LambdaWrapper from '@/src/core/LambdaWrapper';
import ResponseModel from '@/src/models/ResponseModel';
import SQSMessageModel from '@/src/models/SQSMessageModel';
import StatusModel from '@/src/models/StatusModel';
import BaseConfigService from '@/src/services/BaseConfigService';
import HTTPService, { COMICRELIEF_TEST_METADATA_HEADER } from '@/src/services/HTTPService';
import LoggerService from '@/src/services/LoggerService';
import RequestService, { REQUEST_TYPES } from '@/src/services/RequestService';
import SQSService, { SQS_OFFLINE_MODES, SQS_PUBLISH_FAILURE_MODES } from '@/src/services/SQSService';
import TimerService from '@/src/services/TimerService';
import LambdaTermination from '@/src/utils/LambdaTermination';
import PromisifiedDelay from '@/src/utils/PromisifiedDelay';

import lambdaWrapper, * as lib from '@/src';

describe('unit.index', () => {
  describe('default export', () => {
    it('should be a LambdaWrapper instance', () => {
      expect(lambdaWrapper).toBeInstanceOf(LambdaWrapper);
    });

    it('should be configured with SQSService', () => {
      const deps = Object.values(lambdaWrapper.config.dependencies);
      expect(deps).toContain(SQSService);
    });
  });

  // these tests prevent accidental removal of exports

  it('should export DependencyAwareClass', () => {
    expect(lib.DependencyAwareClass).toBe(DependencyAwareClass);
  });

  it('should export DependencyInjection', () => {
    expect(lib.DependencyInjection).toBe(DependencyInjection);
  });

  it('should export LambdaWrapper', () => {
    expect(lib.LambdaWrapper).toBe(LambdaWrapper);
  });

  // models

  it('should export ResponseModel', () => {
    expect(lib.ResponseModel).toBe(ResponseModel);
  });

  it('should export SQSMessageModel', () => {
    expect(lib.SQSMessageModel).toBe(SQSMessageModel);
  });

  it('should export StatusModel', () => {
    expect(lib.StatusModel).toBe(StatusModel);
  });

  // services

  it('should export BaseConfigService', () => {
    expect(lib.BaseConfigService).toBe(BaseConfigService);
  });

  it('should export HTTPService', () => {
    expect(lib.HTTPService).toBe(HTTPService);
    expect(lib.COMICRELIEF_TEST_METADATA_HEADER).toBe(COMICRELIEF_TEST_METADATA_HEADER);
  });

  it('should export LoggerService', () => {
    expect(lib.LoggerService).toBe(LoggerService);
  });

  it('should export RequestService', () => {
    expect(lib.RequestService).toBe(RequestService);
    expect(lib.REQUEST_TYPES).toBe(REQUEST_TYPES);
  });

  it('should export SQSService', () => {
    expect(lib.SQSService).toBe(SQSService);
    expect(lib.SQS_OFFLINE_MODES).toBe(SQS_OFFLINE_MODES);
    expect(lib.SQS_PUBLISH_FAILURE_MODES).toBe(SQS_PUBLISH_FAILURE_MODES);
  });

  it('should export TimerService', () => {
    expect(lib.TimerService).toBe(TimerService);
  });

  // utils

  it('should export LambdaTermination', () => {
    expect(lib.LambdaTermination).toBe(LambdaTermination);
  });

  it('should export PromisifiedDelay', () => {
    expect(lib.PromisifiedDelay).toBe(PromisifiedDelay);
  });
});
