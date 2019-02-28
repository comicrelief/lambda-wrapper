import validate from 'validate.js';
import Model from '../Model.model';
import requestConstraints from './MarketingPreference.constraints.json';
import ResponseModel from '../Response.model';

// Define action specific error types
export const ERROR_TYPES = {
  VALIDATION_ERROR: new ResponseModel({}, 400, 'required fields are missing'),
};

export default class MarketingPreference extends Model {
  /**
   * Message constructor
   * @param data object
   */
  constructor(data = {}) {
    super();

    this.firstname = null;
    this.lastname = null;
    this.phone = null;
    this.mobile = null;
    this.address1 = null;
    this.address2 = null;
    this.address3 = null;
    this.town = null;
    this.postcode = null;
    this.country = null;
    this.campaign = '';
    this.transSource = '';
    this.transSourceUrl = '';
    this.transType = 'prefs';
    this.email = null;
    this.permissionPost = null;
    this.permissionEmail = null;
    this.permissionPhone = null;
    this.permissionSMS = null;
    this.timestamp = null;

    this.instantiateFunctionWithDefinedValue('setFirstName', data.firstname);
    this.instantiateFunctionWithDefinedValue('setLastName', data.lastname);
    this.instantiateFunctionWithDefinedValue('setPhone', data.phone);
    this.instantiateFunctionWithDefinedValue('setMobile', data.mobile);
    this.instantiateFunctionWithDefinedValue('setAddress1', data.address1);
    this.instantiateFunctionWithDefinedValue('setAddress2', data.address2);
    this.instantiateFunctionWithDefinedValue('setAddress3', data.address3);
    this.instantiateFunctionWithDefinedValue('setTown', data.town);
    this.instantiateFunctionWithDefinedValue('setPostcode', data.postcode);
    this.instantiateFunctionWithDefinedValue('setCountry', data.country);
    this.instantiateFunctionWithDefinedValue('setCampaign', data.campaign);
    this.instantiateFunctionWithDefinedValue('setTransSource', data.transSource);
    this.instantiateFunctionWithDefinedValue('setTransSourceUrl', data.transSourceUrl);
    this.instantiateFunctionWithDefinedValue('setEmail', data.email);
    this.instantiateFunctionWithDefinedValue('setPermissionPost', data.permissionPost);
    this.instantiateFunctionWithDefinedValue('setPermissionEmail', data.permissionEmail);
    this.instantiateFunctionWithDefinedValue('setPermissionPhone', data.permissionPhone);
    this.instantiateFunctionWithDefinedValue('setPermissionSMS', data.permissionSMS);
    if (typeof data.timestamp !== 'undefined' && data.timestamp !== '' && data.timestamp !== null) {
      this.instantiateFunctionWithDefinedValue('setTimestamp', data.timestamp);
    } else {
      this.generateTimestamp();
    }
  }

  /**
   * Get First Name
   * @return {string|*}
   */
  getFirstName() {
    return this.firstname;
  }

  /**
   * Set First Name
   * @param value string
   */
  setFirstName(value: string) {
    this.firstname = value;
  }

  /**
   * Get Last Name
   * @return {string|*}
   */
  getLastName() {
    return this.lastname;
  }

  /**
   * Set Last Name
   * @param value string
   */
  setLastName(value: string) {
    this.lastname = value;
  }

  /**
   * Get phone
   * @return {string|*}
   */
  getPhone() {
    return this.phone;
  }

  /**
   * Set phone
   * @param value string
   */
  setPhone(value: string) {
    this.phone = value;
  }

  /**
   * Get Mobile
   * @return {string|*}
   */
  getMobile() {
    return this.mobile;
  }

  /**
   * Set Mobile
   * @param value string
   */
  setMobile(value: string) {
    this.mobile = value;
  }

  /**
   * Get Address Line 1
   * @return {string|*}
   */
  getAddress1() {
    return this.address1;
  }

  /**
   * Set Address Line 1
   * @param value string
   */
  setAddress1(value: string) {
    this.address1 = value;
  }

  /**
   * Get Address Line 2
   * @return {string|*}
   */
  getAddress2() {
    return this.address2;
  }

  /**
   * Set Address Line 2
   * @param value string
   */
  setAddress2(value: string) {
    this.address2 = typeof value === 'undefined' || value === '' ? null : value;
  }

  /**
   * Get Address Line 3
   * @return {string|*}
   */
  getAddress3() {
    return this.address3;
  }

  /**
   * Set Address Line 3
   * @param value string
   */
  setAddress3(value: string) {
    this.address3 = typeof value === 'undefined' || value === '' ? null : value;
  }

  /**
   * Get Town
   * @return {string|*}
   */
  getTown() {
    return this.town;
  }

  /**
   * Set Town
   * @param value string
   */
  setTown(value: string) {
    this.town = value;
  }

  /**
   * Get Postcode
   * @return {string|*}
   */
  getPostcode() {
    return this.postcode;
  }

  /**
   * Set Postcode
   * @param value string
   */
  setPostcode(value: string) {
    this.postcode = value;
  }

  /**
   * Get Country
   * @return {string|*}
   */
  getCountry() {
    return this.country;
  }

  /**
   * Set Country
   * @param value string
   */
  setCountry(value: string) {
    this.country = value;
  }

  /**
   * Get Campaign
   * @return {string|*}
   */
  getCampaign() {
    return this.campaign;
  }

  /**
   * Set Campaign
   * @param value string
   */
  setCampaign(value: string) {
    this.campaign = value;
  }

  /**
   * Get Transaction Source
   * @return {string|*}
   */
  getTransSource() {
    return this.transSource;
  }

  /**
   * Set Transaction Source
   * @param value string
   */
  setTransSource(value: string) {
    this.transSource = value;
  }

  /**
   * Get Transaction Source URL
   * @return {string|*}
   */
  getTransSourceUrl() {
    return this.transSourceUrl;
  }

  /**
   * Set Transaction Source URL
   * @param value string
   */
  setTransSourceUrl(value: string) {
    this.transSourceUrl = value;
  }

  /**
   * Get Transaction Type
   * @return {string|*}
   */
  getTransType() {
    return this.transType;
  }

  /**
   * Set Transaction Type
   * @param value string
   */
  setTransType(value: string) {
    this.transType = value;
  }

  /**
   * Get Email
   * @return {string|*}
   */
  getEmail() {
    return this.email;
  }

  /**
   * Set Email
   * @param value string
   */
  setEmail(value: string) {
    this.email = value;
  }

  /**
   * Get Email Permission
   * @return {string|*}
   */
  getPermissionEmail() {
    return this.permissionEmail;
  }

  /**
   * Set Email Permission
   * @param value string
   */
  setPermissionEmail(value: string) {
    this.permissionEmail = typeof value === 'undefined' || value === '' ? null : value;
  }

  /**
   * Get Post Permission
   * @return {string|*}
   */
  getPermissionPost() {
    return this.permissionPost;
  }

  /**
   * Set Post Permission
   * @param value string
   */
  setPermissionPost(value: string) {
    this.permissionPost = typeof value === 'undefined' || value === '' ? null : value;
  }

  /**
   * Get Phone Permission
   * @return {string|*}
   */
  getPermissionPhone() {
    return this.permissionPhone;
  }

  /**
   * Set Phone Permission
   * @param value string
   */
  setPermissionPhone(value: string) {
    this.permissionPhone = typeof value === 'undefined' || value === '' ? null : value;
  }

  /**
   * Get SMS Permission
   * @return {string|*}
   */
  getPermissionSMS() {
    return this.permissionSMS;
  }

  /**
   * Set SMS Permission
   * @param value string
   */
  setPermissionSMS(value: string) {
    this.permissionSMS = typeof value === 'undefined' || value === '' ? null : value;
  }

  /**
   * Get Timestamp
   * @return {string|*}
   */
  getTimestamp() {
    return this.timestamp;
  }

  /**
   * Set Timestamp
   * @param value string
   */
  setTimestamp(value: string) {
    this.timestamp = value;
  }

  /**
   * Generate Timestamp
   * @return {string|*}
   */
  generateTimestamp() {
    this.timestamp = Math.floor(Date.now() / 1000);
  }

  /**
   * Get Base entity mappings
   * @return {object}
   */
  getEntityMappings() {
    return {
      firstname: this.getFirstName(),
      lastname: this.getLastName(),
      phone: this.getPhone(),
      mobile: this.getMobile(),
      address1: this.getAddress1(),
      address2: this.getAddress2(),
      address3: this.getAddress3(),
      town: this.getTown(),
      postcode: this.getPostcode(),
      country: this.getCountry(),
      campaign: this.getCampaign(),
      transSource: this.getTransSource(),
      transSourceUrl: this.getTransSourceUrl(),
      transType: this.getTransType(),
      email: this.getEmail(),
      permissionEmail: this.getPermissionEmail(),
      permissionPost: this.getPermissionPost(),
      permissionPhone: this.getPermissionPhone(),
      permissionSMS: this.getPermissionSMS(),
      timestamp: this.getTimestamp(),
    };
  }

  /**
   * Validate the model
   * @return {Promise<any>}
   */
  validate() {
    return new Promise((resolve, reject) => {
      const requestConstraintsClone = Object.assign({}, requestConstraints);
      if ((this.getPermissionEmail() !== null
        && this.getPermissionEmail() !== ''
        && this.getPermissionEmail() !== '0')
      || this.getEmail() !== '') {
        if (this.getEmail() !== '') {
          requestConstraintsClone.email = { email: true };
        } else {
          requestConstraintsClone.email = { presence: { allowEmpty: false } };
        }
      }
      // Update constraints if fields are not empty

      requestConstraintsClone.firstname = this.getFirstName() !== null && this.getFirstName() !== '' ? { format: { pattern: "[a-zA-Z.'-_ ]+", flags: 'i', message: 'can only contain alphabetical characters' } } : '';
      requestConstraintsClone.lastname = this.getLastName() !== null && this.getLastName() !== '' ? { format: { pattern: "[a-zA-Z.'-_ ]+", flags: 'i', message: 'can only contain alphabetical characters' } } : '';
      requestConstraintsClone.phone = this.getPhone() !== null && this.getPhone() !== '' ? { format: { pattern: '[0-9 ]+', flags: 'i', message: 'can only contain numerical characters' } } : '';
      requestConstraintsClone.mobile = this.getMobile() !== null && this.getMobile() !== '' ? { format: { pattern: '[0-9 ]+', flags: 'i', message: 'can only contain numerical characters' } } : '';
      requestConstraintsClone.address1 = this.getAddress1() !== null && this.getAddress1() !== '' ? { format: { pattern: "[a-zA-Z.'-_& ]+", flags: 'i', message: 'can only contain alphanumeric characters and . \' - _ &' } } : '';
      requestConstraintsClone.country = this.getCountry() !== null && this.getCountry() !== '' ? { format: { pattern: "[a-zA-Z.'-_& ]+", flags: 'i', message: 'can only contain alphabetical characters and . \' - _ &' } } : '';

      const validation = validate(this.getEntityMappings(), requestConstraintsClone);

      if (typeof validation === 'undefined') {
        return resolve();
      }

      const validationErrorResponse = ERROR_TYPES.VALIDATION_ERROR;
      validationErrorResponse.setBodyVariable('validation_errors', validation);

      return reject(validationErrorResponse);
    });
  }
}
