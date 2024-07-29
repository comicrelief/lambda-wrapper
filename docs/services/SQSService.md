# SQSService

## Usage

SQS queues are configured inside an `sqs` key in your Lambda Wrapper config.

The `queues` key maps short friendly names to the full SQS queue name. Usually we define queue names in our `serverless.yml` and provide them to the application via environment variables.

```ts
import lambdaWrapper, { WithSQSServiceConfig } from '@comicrelief/lambda-wrapper';

export default lambdaWrapper.configure<WithSQSServiceConfig>({
  sqs: {
    queues: {
      // add an entry for each queue mapping to its AWS name
      submissions: process.env.SQS_QUEUE_SUBMISSIONS as string,
    },
  },
});
```

This config is optional – not every application uses SQS!

You can then send messages to a queue within your Lambda handler using the `publish` method.

```ts
import { SQSService } from '@comicrelief/lambda-wrapper';

import lambdaWrapper from '@/src/config/LambdaWrapper';

export default lambdaWrapper.wrap(async (di) => {
  const sqs = di.get(SQSService);
  const message = { data: 'Hello SQS!' };
  await sqs.publish('submissions', message);
});
```

## In TypeScript

When using TypeScript, queue names are inferred from your Lambda Wrapper config so that IntelliSense can provide hints and TypeScript will tell you at compile-time if you try to publish to an undefined queue.

```ts
// ok
await sqs.publish('submissions', message);

// error: Argument of type '"submission"' is not assignable to parameter of
// type '"submissions"'.
await sqs.publish('submission', message);
```

Note that if you're passing the queue name in as a variable, you'll need to ensure the variable type is specific enough and not simply `string`. If you have a list of queue names you will need to declare it `as const`. Otherwise, use string literal types, or the `QueueName` generic type which extracts the type of all queue names from your Lambda Wrapper config.

```ts
const myQueues = ['queue1', 'queue2'];
for (const queue of myQueues) {
  // won't compile because `queue` is of type `string`
  await sqs.publish(queue, message);
}

const myQueues = ['queue1', 'queue2'] as const;
for (const queue of myQueues) {
  // ok now because `queue` is of type `"queue1" | "queue2"`
  await sqs.publish(queue, message);
}

// you can also simply use string literal types
let queue: "queue1" | "queue2";

// or accept any queue defined in the config using `QueueName`
let queue: QueueName<typeof lambdaWrapper.config>;
```

This is all pretty cool, but the current implementation has a caveat: the `WithSQSServiceConfig` type has to be a little vague about `sqs.queues` in order to get TypeScript to infer its keys. The following config will not raise any errors itself, but is invalid and will make the `QueueName` type `never`.

```ts
lambdaWrapper.configure<WithSQSServiceConfig>({
  sqs: {
    queues: {
      good: 'good-queue',
      bad: 0, // oops, not a string, but no errors here!
    },
  },
});

// even though this is queue has valid config, the invalid one breaks it:
// Argument of type 'string' is not assignable to parameter of type 'never'.
await sqs.publish('good', message);
```

If you start getting _not assignable to parameter of type 'never'_ errors on all your `SQSService` method calls, double-check that your config is correct. Be particularly careful with environment variables – by default they have type `string | undefined`. In the first example at the top of this page, a type assertion was used to coerce this to `string`.

## Serverless Offline & SQS Emulation

Serverless Offline only emulates API Gateway and Lambda, so sending an SQS message would use the real SQS queue and trigger the consumer function (if any) in AWS. When working with offline code, you often want the local functions to be invoked instead.

Offline SQS behaviour can be configured by setting the `LAMBDA_WRAPPER_OFFLINE_SQS_MODE` environment variable. Available modes are:

- `direct` (the default): invokes the consumer function directly via an offline Lambda endpoint
- `local`: send messages to an offline SQS endpoint, such as Localstack
- `aws`: no special handling of SQS offline; messages will be sent to AWS

Details of each mode are documented in the sections below. When you send a message using `SQSService.prototype.publish`, it will check which mode to use and dispatch the message appropriately. These modes take effect only when running offline (as defined by `DependencyInjection.prototype.isOffline`). In a deployed environment, SQS messages will always be sent to AWS SQS.

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
        submissions: process.env.SQS_QUEUE_SUBMISSIONS as string,
      },
      queueConsumers: {
        // add an entry mapping each queue to its consumer function name
        submissions: 'SubmissionConsumer',
      },
    }
  });
  ```

  Now when a message is sent using `sqs.publish('submissions', message)`, the `SubmissionConsumer` function will be directly invoked to consume the message.

- Set `process.env.SERVICE_LAMBDA_URL`.

  While creating the Lambda client, we need to point it to our offline environment. Lambda Wrapper will take care of the specifics, but it will need to know the Lambda endpoint URL. This _can_ and _must_ be specified via the `SERVICE_LAMBDA_URL` environment variable.

  The URL is likely to be your localhost URL and the next available port from the offline API Gateway. So, if you are running Serverless Offline on `http://localhost:3001`, the Lambda URL is likely to be `http://localhost:3002`. You can check the port in the output during Serverless Offline startup by looking for the following line:

  ```plaintext
  offline: Offline [http for lambda] listening on http://localhost:3002
  ```

#### Caveats

1. You will be running the SQS-triggered lambdas in the same Serverless Offline context as your triggering lambda. Expect logs from both lambdas in the Serverless Offline output.

2. If you await `sqs.publish` you will effectively wait until all SQS-triggered lambdas (and possibly their own SQS-triggered lambdas) have all completed. This is necessary to avoid any pending execution (i.e. the lambda terminating before its async processes are completed).

3. If the triggered lambda incurs an exception, this will be propagated upstream, effectively killing the execution of the calling lambda.

4. Queue producer and consumer functions must not have custom deployed Lambda names.

### Local SQS mode

Use this mode by setting `LAMBDA_WRAPPER_OFFLINE_SQS_MODE=local`. Messages will still be sent to an SQS queue, but using a locally simulated version instead of AWS. This allows you to test your service using a tool like Localstack.

By default, messages will be sent to a SQS service running on `localhost:4576`. If you need to change the hostname, you can set `process.env.LAMBDA_WRAPPER_OFFLINE_SQS_HOST`.
Also, if you need to change the port, you can set `process.env.LAMBDA_WRAPPER_OFFLINE_SQS_PORT`.

### AWS SQS mode

Use this mode by setting `LAMBDA_WRAPPER_OFFLINE_SQS_MODE=aws`. Messages will be sent to the real queue in AWS. This mode is useful when a queue is consumed by an external service, rather than another function in the service under test.

In order for queue URLs to be correctly constructed, you must either:

- set `AWS_ACCOUNT_ID` to the account ID that hosts your queue; or
- invoke offline functions via the Lambda API, passing a context that contains a realistic `invokedFunctionArn` including the account ID.
