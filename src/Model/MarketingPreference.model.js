import validate from 'validate.js';
import Model from './Model.model';
import requestConstraints from '../Constraints/MarketingPreferences.constraints.json';
import ResponseModel from './Response.model';

// Define action specific error types
export const ERROR_TYPES = {
  VALIDATION_ERROR: new ResponseModel({}, 400, 'required fields are missing'),
};

export default class MarketingPreference extends Model {
  /**
   * Message constructor
   * @param data
   */
  constructor(data) {
    super();

    this.firstname = data.firstname;
    this.lastname = data.lastname;
    this.phone = data.phone;
    this.mobile = data.mobile;
    this.address1 = data.address1;
    this.address2 = data.address2;
    this.address3 = data.address3;
    this.town = data.town;
    this.postcode = data.postcode;
    this.country = data.country;
    this.campaign = data.campaign;
    this.transSource = data.transSource;
    this.transSourceUrl = data.transSourceUrl;
    this.transType = data.transType;
    this.email = data.email;
    this.permissionPost = data.permissionPost;
    this.permissionEmail = data.permissionEmail;
    this.permissionPhone = data.permissionPhone;
    this.permissionSMS = data.permissionSMS;
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
    this.address2 = value;
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
    this.address3 = value;
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
    this.permissionEmail = value;
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
    this.permissionPost = value;
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
    this.permissionPhone = value;
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
    this.permissionSMS = value;
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
    };
  }

  /**
   * Test a request against validation constraints
   * @param entityDataValues
   * @return {Promise<any>}
   */
  validateRequest(entityDataValues) {
    return new Promise((resolve, reject) => {
      const validation = validate(entityDataValues, requestConstraints);

      if (typeof validation === 'undefined') {
        resolve();
      } else {
        const validationErrorResponse = ERROR_TYPES.VALIDATION_ERROR;
        validationErrorResponse.setBodyVariable('validation_errors', validation);

        reject(validationErrorResponse);
      }
    });
  }
}
