import { LambdaWrapperConfig } from './core/config';
import LambdaWrapper from './core/lambda-wrapper';
import LoggerService from './services/LoggerService';
import SQSService, { WithSQSServiceConfig } from './services/SQSService';
import TimerService from './services/TimerService';

/**
 * Lambda Wrapper preconfigured with our core services that can be used
 * straight out of the box.
 *
 * Use `lambdaWrapper.configure()` to add your own dependencies.
 */
const lambdaWrapper = new LambdaWrapper<LambdaWrapperConfig & WithSQSServiceConfig>({
  dependencies: {
    LoggerService,
    SQSService,
    TimerService,
  },
});

export default lambdaWrapper;

export { Context, Handler } from 'aws-lambda';

export { LambdaWrapperConfig } from './core/config';
export { default as DependencyAwareClass } from './core/dependency-base';
export { default as DependencyInjection } from './core/dependency-injection';
export { default as LambdaWrapper } from './core/lambda-wrapper';

export {
  default as ResponseModel,
} from './models/ResponseModel';

export {
  default as LoggerService,
} from './services/LoggerService';
export {
  default as SQSService,
  SQSServiceConfig,
  WithSQSServiceConfig,
} from './services/SQSService';
export {
  default as TimerService,
} from './services/TimerService';
