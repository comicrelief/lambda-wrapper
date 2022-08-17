import lambdaWrapper, {
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
});
