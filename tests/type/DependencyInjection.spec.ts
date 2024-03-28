import { expectTypeOf } from 'expect-type';

import lambdaWrapper, {
  DependencyAwareClass,
  DependencyInjection,
  LoggerService,
  SQSService,
} from '../../src/index';
import { mockContext, mockEvent } from '../mocks/aws';

describe('type.DependencyInjection', () => {
  const di = new DependencyInjection(lambdaWrapper.config, mockEvent, mockContext);

  describe('get', () => {
    it('should return a LoggerService instance if passed LoggerService', () => {
      expectTypeOf(di.get(LoggerService)).toEqualTypeOf<LoggerService>();
    });

    it('should return an SQSService instance if passed SQSService', () => {
      // for this one we also expect the TConfig type parameter to be correct
      expectTypeOf(di.get(SQSService)).toEqualTypeOf<SQSService<typeof di.config>>();
    });

    it('should accept any dependency-aware class', () => {
      // Currently, the type system does not restrict you to getting only
      // dependencies that are specified in the Lambda Wrapper config, however
      // doing so will result in a runtime error.
      class Good extends DependencyAwareClass {}
      expectTypeOf(di.get).toBeCallableWith(Good);
      expectTypeOf(di.get(Good)).toEqualTypeOf<InstanceType<typeof Good>>();
    });

    it('should not accept classes that are not dependency-aware', () => {
      class Bad {}
      // @ts-expect-error: it should _not_ be callable with Bad
      expectTypeOf(di.get).toBeCallableWith(Bad);
    });
  });
});
