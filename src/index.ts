import { LambdaWrapperConfig } from './core/config';
import LambdaWrapper from './core/lambda-wrapper';
import SQSService, { WithSQSServiceConfig } from './services/SQSService';

/**
 * Lambda Wrapper preconfigured with our core services that can be used
 * straight out of the box.
 *
 * Use `lambdaWrapper.configure()` to add your own dependencies.
 */
const lambdaWrapper = new LambdaWrapper<LambdaWrapperConfig & WithSQSServiceConfig>({
  dependencies: {
    SQSService,
  },
});

export default lambdaWrapper;

export { Context, Handler } from 'aws-lambda';

export { LambdaWrapperConfig } from './core/config';
export { default as DependencyAwareClass } from './core/dependency-base';
export { default as DependencyInjection } from './core/dependency-injection';
export { default as LambdaWrapper } from './core/lambda-wrapper';

export {
  default as SQSService,
  SQSServiceConfig,
  WithSQSServiceConfig,
} from './services/SQSService';
