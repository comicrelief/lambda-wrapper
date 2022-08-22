# BaseConfigService

Instead of reimplementing the service status get and set logic across several services, Lambda Wrapper provides a Status service that handles these two operations for us.

## Usage

This class is to be extended by the implementing services so that `defaultConfig` and possibly `s3Config` can be overriden / extended. As such, it is not included as a dependency by default and must be explicitly added.

Example implementation with validation:

```ts
// src/services/ConfigService.ts
import { BaseConfigService } from '@comicrelief/lambda-wrapper';

import { ConfigModel, ConfigProps } from '@/src/models/Config';

export default class ConfigService extends BaseConfigService {
  async put(config): Promise<ConfigProps> {
    const validated = await ConfigModel.validate(config);
    return super.put(validated);
  }

  async get(): Promise<ConfigProps> {
    const config = await super.get();
    return ConfigModel.validate(config);
  }
}
```

Config is typed as `unknown` in the base class since you shouldn't trust what's in the bucket. Override the `get` and `put` methods to pass the results through some validation to ensure the config is valid and can safely be typed.

Then add to your Lambda Wrapper dependencies:

```ts
// src/config/lambda-wrapper.ts
import lambdaWrapper from '@comicrelief/lambda-wrapper';

import ConfigService from '@/src/services/ConfigService';

export default lambdaWrapper.configure({
  dependencies: {
    ConfigService,
    // ...
  },
});
```
