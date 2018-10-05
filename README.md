Lambda Wrapper
--------------

[![CircleCI](https://circleci.com/gh/comicrelief/lambda-wrapper.svg?style=svg&circle-token=7db6e0ff0526bd635424f303fd4ffffc7ea05aed)](https://circleci.com/gh/comicrelief/lambda-wrapper)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![semantic-release](https://badge.fury.io/js/%40comicrelief%2Flambda-wrapper.svg)](https://www.npmjs.com/package/@comicrelief/lambda-wrapper)

When writing Serverless endpoints, we have found ourselves replicating boiler plate code. The aim of this package is to
provide a wrapper for our lambda functions, to provide some level of dependency and configuration injection and to
reduce time spent on project setup.

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

## Semantic releases

Release management is automated using [semantic-release](https://www.npmjs.com/package/semantic-release).
