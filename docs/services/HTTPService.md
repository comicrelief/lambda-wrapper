# HTTPService

Wrapper for `axios.request` that:

- sets a default timeout of 10 seconds
- forwards a `x-comicrelief-test-metadata` header if one was provided in the request from upstream
