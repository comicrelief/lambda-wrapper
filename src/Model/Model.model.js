import validate from 'validate.js/validate';

export default class Model {
  /**
   * Instantiate a function with a value if defined
   * @param classFunctionName string
   * @param value             mixed
   */
  instantiateFunctionWithDefinedValue(classFunctionName, value) {
    if (typeof value !== 'undefined') {
      this[classFunctionName](value);
    }
  }

  /**
   * Validate values against constraints
   * @param values      object
   * @param constraints object
   * @return {boolean}
   */
  validateAgainstConstraints(values: object, constraints: object): boolean {
    const validation = validate(values, constraints);
    return typeof validation === 'undefined';
  }
}
