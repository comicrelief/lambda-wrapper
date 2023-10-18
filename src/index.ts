import LambdaWrapper from './core/LambdaWrapper';
import { LambdaWrapperConfig } from './core/config';
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
export { default as DependencyAwareClass } from './core/DependencyAwareClass';
export { default as DependencyInjection } from './core/DependencyInjection';
export { default as LambdaWrapper, WrapOptions } from './core/LambdaWrapper';

export {
  default as ResponseModel,
  RESPONSE_HEADERS,
} from './models/ResponseModel';
export {
  default as SQSMessageModel,
} from './models/SQSMessageModel';

export {
  default as BaseConfigService,
} from './services/BaseConfigService';
export {
  default as HTTPService,
  COMICRELIEF_TEST_METADATA_HEADER,
} from './services/HTTPService';
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
  QueueName,
  SQS_OFFLINE_MODES,
  SQS_PUBLISH_FAILURE_MODES,
  SQSServiceConfig,
  WithSQSServiceConfig,
} from './services/SQSService';
export {
  default as TimerService,
} from './services/TimerService';

export {
  ServiceStatus,
  Status,
} from './types/Status';

export { default as LambdaTermination } from './utils/LambdaTermination';
export { default as PromisifiedDelay } from './utils/PromisifiedDelay';
