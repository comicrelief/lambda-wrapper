Lambda Wrapper
--------------

[![CircleCI](https://circleci.com/gh/comicrelief/lambda-wrapper.svg?style=svg&circle-token=7db6e0ff0526bd635424f303fd4ffffc7ea05aed)](https://circleci.com/gh/comicrelief/lambda-wrapper)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![semantic-release](https://badge.fury.io/js/%40comicrelief%2Flambda-wrapper.svg)](https://www.npmjs.com/package/@comicrelief/lambda-wrapper)

When writing Serverless endpoints, we have found ourselves replicating a lot of boiler plate code to do basic actions,
such as reading request variables or writing to SQS. The aim of this package is to provide a wrapper for our lambda
functions, to provide some level of dependency and configuration injection and to reduce time spent on project setup.

# Installation & usage

Install via npm:

```bash
npm install --save @comicrelief/lambda-wrapper
```

Or via yarn:

```bash
yarn add @comicrelief/lambda-wrapper
```

You can then wrap your lambdas as follows.

```yaml
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

Serverless Offline only emulates API Gateway & Lambda, so publishing an SQS message will effectively use the SQS queue and trigger the remote lambda, if any. When working with offline code, the expectation is that the local will be invoked instead.

In order to emulate SQS, `SQSService.prototype.publish` will look for `DependencyInjection.prototype.isOffline`. In that case, a lambda client will be created and the message will be delivered to the serverless offline endpoint, effectively running the triggered lambda _immediately_ as part of the original lambda invokation. This works very well in the offline environment because invoking a lambda will trigger its whole (local) execution tree.

### How to use it?
To take advantage of SQS Emulation, you will need to define the following in the implementing service:

**QUEUE_CONSUMERS**
In your `src/Config/Configuration` define a `QUEUE_CONSUMERS` object. `QUEUE_CONSUMER` will map the queue to the fully qualified `FunctionName` that we want to trigger.

Additionally, you will need to export `QUEUE_CONSUMERS` as part of your default export, along side `DEFINITIONS`, `DEPENDENCIES`, `QUEUES`, `QUEUE_DEFINITIONS`, etc.

A `Configuration` example can be found in the `serverless-prize-platform` repository [link](https://github.com/comicrelief/serverless-prize-platform/blob/master/src/Config/Configuration.js).

**process.env.SERVICE_LAMBDA_URL**
While creating the Lambda client, we need to point it to our serverless offline environment. LambdaWrapper will take care of the specifics, but it will need to know the Lambda endpoint URL. This _can_ and _must_ be specified via the `process.env.SERVICE_LAMBDA_URL` environment variable. The URL is likely to be your localhost url and the next available port from the serverless offline port. So, if you are running serverless offline on `http://localhost:3001`, the `process.env.SERVICE_LAMBDA_URL` is likely to be `http://localhost:3002`.

You can check the port in the output of Serverless Offline startup, in particular look for the following line:

```
offline: Offline [http for lambda] listening on http://localhost:3002
```

### Caveats

1. You will be running the SQS triggered lambdas in the same serverless offline context you are running your triggering lambda. Expect logs of the triggered lambda in the serverless offline output.
2. If you await `sqs.publish` you will effectively await until all SQS triggered lambdas (and possibly their own SQS triggered lambdas) have all completed. This is necessary to avoid any pending execution (i.e. the lambda terminating before its async processes are completed).
3. If the triggered lambda incurs in an exception, this will be propagated upstream effectively killing the execution of the calling lambda.

# Semantic release
Release management is automated using [semantic-release](https://www.npmjs.com/package/semantic-release).
