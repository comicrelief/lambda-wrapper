/* eslint-disable class-methods-use-this */
import validate from 'validate.js/validate';

/**
 * Model base class
 */
export default class Model {
  /**
   * Instantiate a function with a value if defined
   *
   * @param classFunctionName string
   * @param value             mixed
   */
  instantiateFunctionWithDefinedValue(classFunctionName, value) {
    if (value !== undefined) {
      this[classFunctionName](value);
    }
  }

  /**
   * Validate values against constraints
   *
   * @param values      object
   * @param constraints object
   * @returns {boolean}
   */
  validateAgainstConstraints(values: object, constraints: object): boolean {
    const validation = validate(values, constraints);
    return validation === undefined;
  }
}
