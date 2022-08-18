# Lambda Wrapper

![GitHub Actions](https://github.com/comicrelief/lambda-wrapper/actions/workflows/main.yml/badge.svg)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![semantic-release](https://badge.fury.io/js/%40comicrelief%2Flambda-wrapper.svg)](https://www.npmjs.com/package/@comicrelief/lambda-wrapper)

When writing Serverless applications, we have found ourselves replicating a lot of boilerplate code to do basic actions, such as reading request data or sending messages to SQS. The aim of this package is to provide a wrapper for our Lambda functions, to provide some level of dependency and configuration injection and to reduce time spent on project setup.

## Getting started

Install via npm or Yarn:

```bash
npm i @comicrelief/lambda-wrapper
# or
yarn add @comicrelief/lambda-wrapper
```

You can then wrap your Lambda handler functions like this:

```ts
// src/Action/Hello.ts
import lambdaWrapper, {
  ResponseModel,
  RequestService,
} from '@comicrelief/lambda-wrapper';

export default lambdaWrapper.wrap(async (di) => {
  const request = di.get(RequestService);
  return ResponseModel.generate(
    {},
    200,
    `hello ${request.get('name', 'nobody')}`,
  );
});
```

Here we've used the default export `lambdaWrapper` which is a preconfigured instance that can be used out of the box. However, you'll likely want to add your own dependencies and service config using the `configure` method:

```ts
// src/Config/LambdaWrapper.ts
import lambdaWrapper from '@comicrelief/lambda-wrapper';

export default lambdaWrapper.configure({
  // your config goes here
});
```

`configure` returns a new Lambda Wrapper instance with the given configuration. You'll want to export it and then use this when wrapping your handler functions.

Read the next section to see what goes inside the config object!

## Dependencies

Lambda Wrapper comes with some commonly used dependencies built in:

- [SQSService](docs/services/SQSService.md)

Access these via dependency injection. You've already seen an example of this. Pass the dependency class to `di.get()` to get its instance.

```ts
export default lambdaWrapper.wrap(async (di) => {
  const request = di.get(RequestService);
  const sqs = di.get(SQSService);
  // ...
});
```

To add your own dependencies, first extend `DependencyAwareClass`.

```ts
// src/Service/MyService.ts
import { DependencyAwareClass } from '@comicrelief/lambda-wrapper';

export default class MyService extends DependencyAwareClass {
  doSomething() {
    // ...
  }
}
```

Then add it to your Lambda Wrapper configuration in the `dependencies` key.

```ts
// src/Config/LambdaWrapper.ts
import lambdaWrapper from '@comicrelief/lambda-wrapper';
import MyService from '../Service/MyService';

export default lambdaWrapper.configure({
  dependencies: {
    MyService,
  },
});
```

Now you can use it inside your handler functions!

```ts
// src/Action/DoSomething.ts
import lambdaWrapper from '../Config/LambdaWrapper';
import MyService from '../Sevice/MyService';

export default lambdaWrapper.wrap(async (di) => {
  di.get(MyService).doSomething();
});
```

## Service config

Some dependencies need their own config. This goes in per-service keys within your Lambda Wrapper config. For an example, see [SQSService](docs/services/SQSService.md) which uses the `sqs` key.

```ts
export default lambdaWrapper.configure({
  dependencies: {
    // your dependencies
  },
  sqs: {
    // your SQSService config
  },
  // ... other configs ...
});
```

## Development

### Testing

Run `yarn test` to run the unit tests.

When writing a bugfix, start by writing a test that reproduces the problem. It should fail with the current version of Lambda Wrapper, and pass once you've implemented the fix.

When adding a feature, ensure it's covered by tests that adequately define its behaviour.

### Linting

Run `yarn lint` to check code style complies to our standard. Many problems can be auto-fixed using `yarn lint --fix`.

### Releases

Release management is automated using [semantic-release](https://www.npmjs.com/package/semantic-release).
