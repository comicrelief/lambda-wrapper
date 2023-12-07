# RequestService

Provides access to components of the HTTP request being handled.

## Usage

Since Lambda Wrapper v2, the `RequestService` instance is no longer passed as an argument to your wrapped handler, and must be obtained via `di`.

```ts
import lambdaWrapper, { RequestService } from '@comicrelief/lambda-wrapper';

export default lambdaWrapper.wrap(async (di) => {
  const request = di.get(RequestService);
  // get the 'name' request parameter, defaulting to 'world' if not set
  const name = request.get('name', 'world');
  return ResponseModel.generate({}, 200, `Hello, ${name}`);
});
```

### Headers

- `getAllHeaders` returns an object containing all HTTP headers, with all keys lowercase
- `getHeader` returns the value of a single HTTP header
- `getAuthorizationToken` extracts a Bearer token from the `Authorization` header

### Body

For requests that submit data in their body (POST, PATCH, PUT),

- `getAll` parses the body according to the `Content-Type` header
- `get` fetches a single value from the body

### URL parameters

For other request methods without a body (GET, HEAD, DELETE),

- `getAll` returns an object containing all query string parameters
- `get` fetches a single query string parameter

For all requests,

- `getPathParameter` fetches a path parameter value

### Client info

Some limited information about the client making the request is available.

- `getIp` returns the request's source IP address
- `getUserBrowserAndDevice` returns user agent details
