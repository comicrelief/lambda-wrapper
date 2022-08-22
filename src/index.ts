import { LambdaWrapperConfig } from './core/config';
import LambdaWrapper from './core/lambda-wrapper';
import LoggerService from './services/LoggerService';
import RequestService from './services/RequestService';
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
    RequestService,
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
  default as SQSMessageModel,
} from './models/SQSMessageModel';
export {
  default as StatusModel,
  STATUS_TYPES,
} from './models/StatusModel';

export {
  default as LoggerService,
} from './services/LoggerService';
export {
  default as RequestService,
  REQUEST_TYPES,
  RequestFile,
} from './services/RequestService';
export {
  default as SQSService,
  SQS_OFFLINE_MODES,
  SQS_PUBLISH_FAILURE_MODES,
  SQSServiceConfig,
  WithSQSServiceConfig,
} from './services/SQSService';
export {
  default as TimerService,
} from './services/TimerService';

export { default as LambdaTermination } from './utils/LambdaTermination';
export { default as PromisifiedDelay } from './utils/PromisifiedDelay';
