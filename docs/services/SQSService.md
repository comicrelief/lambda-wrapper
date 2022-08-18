# SQSService

## Usage

SQS queues are configured inside an `sqs` key in your Lambda Wrapper config.

The `queues` key maps short friendly names to the full SQS queue name. Usually we define queue names in our `serverless.yml` and provide them to the application via environment variables.

```ts
const lambdaWrapper = lw.configure({
  sqs: {
    queues: {
      // add an entry for each queue mapping to its AWS name
      submissions: process.env.SQS_QUEUE_SUBMISSIONS,
    },
  },
});
```

This config is optional – not every application uses SQS!

You can then send messages to a queue within your Lambda handler using the `send` method.

```ts
export default lambdaWrapper.wrap(async (di) => {
  const sqs = di.get(SQSService);
  const message = { data: 'Hello SQS!' };
  await sqs.send('submissions', message);
});
```

## Serverless Offline & SQS Emulation

Serverless Offline only emulates API Gateway and Lambda, so sending an SQS message would use the real SQS queue and trigger the consumer function (if any) in AWS. When working with offline code, you often want the local functions to be invoked instead.

Offline SQS behaviour can be configured by setting the `LAMBDA_WRAPPER_OFFLINE_SQS_MODE` environment variable. Available modes are:

- `direct` (the default): invokes the consumer function directly via an offline Lambda endpoint
- `local`: send messages to an offline SQS endpoint, such as Localstack
- `aws`: no special handling of SQS offline; messages will be sent to AWS

Details of each mode are documented in the sections below. When you send a message using `SQSService.prototype.send`, it will check which mode to use and dispatch the message appropriately. These modes take effect only when running offline (as defined by `DependencyInjection.prototype.isOffline`). In a deployed environment, SQS messages will always be sent to AWS SQS.

### Direct Lambda mode

This is the default mode if `LAMBDA_WRAPPER_OFFLINE_SQS_MODE` is not set. A Lambda client will be created and the message will be delivered to the offline Lambda endpoint, effectively running the consumer function _immediately_ as part of the original Lambda invocation. This works very well in the offline environment because invoking a Lambda function will trigger its whole (local) execution tree.

To take advantage of SQS emulation, you will need to do the following in your project:

- Include the `queueConsumers` key in your `SQSService` config.

  This maps the queue name to the fully qualified `FunctionName` that we want to trigger when messages are sent to that queue.

  Extending the example from above, your config might look like this:

  ```ts
  const lambdaWrapper = lw.configure({
    sqs: {
      queues: {
        // Add an entry for each queue with its AWS name.
        // Usually we define queue names in our serverless.yml and provide them
        // to the application via environment variables.
        submissions: process.env.SQS_QUEUE_SUBMISSIONS,
      },
      queueConsumers: {
        // See section below about offline SQS emulation.
        submissions: 'SubmissionConsumer',
      },
    }
  });
  ```

  Now when a message is sent using `sqs.send('submissions', message)`, the `SubmissionConsumer` function will be directly invoked to consume the message.

- Set `process.env.SERVICE_LAMBDA_URL`.

  While creating the Lambda client, we need to point it to our offline environment. Lambda Wrapper will take care of the specifics, but it will need to know the Lambda endpoint URL. This _can_ and _must_ be specified via the `SERVICE_LAMBDA_URL` environment variable.

  The URL is likely to be your localhost URL and the next available port from the offline API Gateway. So, if you are running Serverless Offline on `http://localhost:3001`, the Lambda URL is likely to be `http://localhost:3002`. You can check the port in the output during Serverless Offline startup by looking for the following line:

  ```plaintext
  offline: Offline [http for lambda] listening on http://localhost:3002
  ```

#### Caveats

1. You will be running the SQS-triggered lambdas in the same Serverless Offline context as your triggering lambda. Expect logs from both lambdas in the Serverless Offline output.

2. If you await `sqs.send` you will effectively wait until all SQS-triggered lambdas (and possibly their own SQS-triggered lambdas) have all completed. This is necessary to avoid any pending execution (i.e. the lambda terminating before its async processes are completed).

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
