# LoggerService

Provides logging and integrations with our monitoring tools.

For logging we use [Winston](https://github.com/winstonjs/winston). Errors will also be sent to [Sentry](https://sentry.io/) and [Epsagon](https://epsagon.com/) if those are configured.

## Usage

The logger exposes various methods that you can pass messages or objects to for logging:

```ts
import lambdaWrapper, { LoggerService } from '@comicrelief/lambda-wrapper';

export default lambdaWrapper.wrap(async (di) => {
  const logger = di.get(LoggerService);

  // general log message
  logger.info('Doing something');

  // tag the trace so we can find certain tracess more easily in Epsagon
  logger.label('flag');
  logger.metric('transactionId', value);

  try {
    // do something that might throw an error...
  } catch (error) {
    // log the error and flag the trace on Epsagon and Sentry
    logger.error(error);

    // alternatively, use `warning` if this error is not relevant in staging
    // (see Soft Warnings below)
    logger.warning(error);
  }
});
```

## Configuration

### Soft warnings

The `warning` method is equivalent to `error` by default, but can be switched to use `info` by setting `LOGGER_SOFT_WARNING=1` in the environment.

This is handy for muting certain errors in staging, where we expect our integration tests to cause a lot of errors deliberately that would otherwise spam us with Epsagon alerts.

### Epsagon

To configure Epsagon, set the following environment variables:

- `EPSAGON_TOKEN` – your access token
- `EPSAGON_SERVICE_NAME` – the application name (including stage) to record traces under

### Sentry

To configure Sentry, set the following environment variables:

- `RAVEN_DSN` – your Sentry DSN URL
