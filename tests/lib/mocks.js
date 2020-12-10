import { DEFINITIONS } from '../../src/Config/Dependencies';

/**
 * Returns a mocked logger.
 *
 * You can pass an overrides object
 * specifying the return values
 * and/or behaviour for each property.
 *
 * @param {object} overrides
 * @param {object} di
 */
export const getMockedLogger = (overrides = {}, di = null) => {
  const logger = {
    di,
    error: jest.fn().mockImplementation(() => overrides.error || null),
    info: jest.fn().mockImplementation(() => overrides.info || null),
  };

  logger.getContainer = () => logger.di;

  return logger;
};

/**
 * Returns a mocked di.
 *
 * You can pass an overrides object
 * specifying the behaviour of a depedendency.
 *
 * @param {object} overrides
 */
export const getMockedDi = (overrides = {}) => {
  const deps = {
    [DEFINITIONS.LOGGER]: null,
    ...overrides,
  };
  const di = {
    deps,
    get: (key) => deps[key],
  };

  if (!deps[DEFINITIONS.LOGGER]) {
    deps[DEFINITIONS.LOGGER] = getMockedLogger({}, di);
  }

  return di;
};
