import _DependencyAwareClass from '@/src/core/dependency-base';
import _DependencyInjection from '@/src/core/dependency-injection';
import _LambdaWrapper from '@/src/core/lambda-wrapper';
import _SQSService from '@/src/services/SQSService';

import lambdaWrapper, {
  DependencyAwareClass,
  DependencyInjection,
  LambdaWrapper,
  SQSService,
} from '@/src';

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
    expect(DependencyAwareClass).toBe(_DependencyAwareClass);
  });

  it('should export DependencyInjection', () => {
    expect(DependencyInjection).toBe(_DependencyInjection);
  });

  it('should export LambdaWrapper', () => {
    expect(LambdaWrapper).toBe(_LambdaWrapper);
  });

  it('should export SQSService', () => {
    expect(SQSService).toBe(_SQSService);
  });
});
