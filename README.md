# Lambda Wrapper

![GitHub Actions](https://github.com/comicrelief/lambda-wrapper/actions/workflows/main.yml/badge.svg)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![semantic-release](https://badge.fury.io/js/%40comicrelief%2Flambda-wrapper.svg)](https://www.npmjs.com/package/@comicrelief/lambda-wrapper)

When writing Serverless endpoints, we have found ourselves replicating a lot of boiler plate code to do basic actions, such as reading request variables or writing to SQS. The aim of this package is to provide a wrapper for our Lambda functions, to provide some level of dependency and configuration injection and to reduce time spent on project setup.

> 🚀 [Lambda Wrapper v2 is now available in beta!](https://github.com/comicrelief/lambda-wrapper/tree/beta) This major release includes TypeScript support and some significant design changes.

## Installation & usage

Install via npm:

```bash
npm install --save @comicrelief/lambda-wrapper
```

Or via yarn:

```bash
yarn add @comicrelief/lambda-wrapper
```

You can then wrap your lambdas as follows.

```js
import {
  LambdaWrapper,
  ResponseModel,
  RequestService,
} from '@comicrelief/lambda-wrapper';

export default LambdaWrapper({}, (di, request, done) => {
  const response = new ResponseModel({}, 200, `hello ${request.get('name', 'nobody')}`);
  done(null, response.generate());
});
```

## Serverless Offline & SQS Emulation

Serverless Offline only emulates API Gateway and Lambda, so publishing an SQS message would use the real SQS queue and trigger the consumer function (if any) in AWS. When working with offline code, you often want the local functions to be invoked instead.

Offline SQS behaviour can be configured by setting the `LAMBDA_WRAPPER_OFFLINE_SQS_MODE` environment variable. Available modes are:

- `direct` (the default): invokes the consumer function directly via an offline Lambda endpoint
- `local`: send messages to an offline SQS endpoint, such as Localstack
- `aws`: no special handling of SQS offline; messages will be sent to AWS

Details of each mode are documented in the sections below. When you send a message using `SQSService.prototype.publish`, it will check which mode to use and dispatch the message appropriately. These modes take effect only when running offline (as defined by `DependencyInjection.prototype.isOffline`). In a deployed environment, SQS messages will always be sent to AWS SQS.

### Direct Lambda mode

This is the default mode if `LAMBDA_WRAPPER_OFFLINE_SQS_MODE` is not set. A Lambda client will be created and the message will be delivered to the offline Lambda endpoint, effectively running the consumer function _immediately_ as part of the original Lambda invocation. This works very well in the offline environment because invoking a Lambda function will trigger its whole (local) execution tree.

To take advantage of SQS emulation, you will need to define the following in the implementing service:

**QUEUE_CONSUMERS**

In your `src/Config/Configuration` define a `QUEUE_CONSUMERS` object. `QUEUE_CONSUMERS` will map the queue name to the fully qualified `FunctionName` that we want to trigger when messages are published to that queue.

You will need to export `QUEUE_CONSUMERS` as part of your default export, alongside `DEFINITIONS`, `DEPENDENCIES`, `QUEUES`, `QUEUE_DEFINITIONS`, etc.

A `Configuration` example can be found in the `serverless-prize-platform` repository [here](https://github.com/comicrelief/serverless-prize-platform/blob/master/src/Config/Configuration.js).

**process.env.SERVICE_LAMBDA_URL**

While creating the Lambda client, we need to point it to our offline environment. LambdaWrapper will take care of the specifics, but it will need to know the Lambda endpoint URL. This _can_ and _must_ be specified via the `SERVICE_LAMBDA_URL` environment variable.

The URL is likely to be your localhost URL and the next available port from the offline API Gateway. So, if you are running Serverless Offline on `http://localhost:3001`, the Lambda URL is likely to be `http://localhost:3002`. You can check the port in the output during Serverless Offline startup by looking for the following line:

    offline: Offline [http for lambda] listening on http://localhost:3002

#### Caveats

1. You will be running the SQS-triggered lambdas in the same Serverless Offline context as your triggering lambda. Expect logs from both lambdas in the Serverless Offline output.

2. If you await `sqs.publish` you will effectively wait until all SQS-triggered lambdas (and possibly their own SQS-triggered lambdas) have all completed. This is necessary to avoid any pending execution (i.e. the lambda terminating before its async processes are completed).

3. If the triggered lambda incurs an exception, this will be propagated upstream, effectively killing the execution of the calling lambda.

### Local SQS mode

Use this mode by setting `LAMBDA_WRAPPER_OFFLINE_SQS_MODE=local`. Messages will still be sent to an SQS queue, but using a locally simulated version instead of AWS. This allows you to test your service using a tool like Localstack.

By default, messages will be sent to a SQS service running on `localhost:4576`. If you need to change the hostname, you can set `process.env.LAMBDA_WRAPPER_OFFLINE_SQS_HOST`.
Also, if you need to change the port, you can set `process.env.LAMBDA_WRAPPER_OFFLINE_SQS_PORT`.

### AWS SQS mode

Use this mode by setting `LAMBDA_WRAPPER_OFFLINE_SQS_MODE=aws`. Messages will be sent to the real queue in AWS. This mode is useful when a queue is consumed by an external service, rather than another function in the service under test.

In order for queue URLs to be correctly constructed, you must either:

- set `AWS_ACCOUNT_ID` to the account ID that hosts your queue; or
- invoke offline functions via the Lambda API, passing a context that contains a realistic `invokedFunctionArn` including the account ID.

## Semantic release

Release management is automated using [semantic-release](https://www.npmjs.com/package/semantic-release).
