'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ERROR_TYPES = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _validate2 = require('validate.js');

var _validate3 = _interopRequireDefault(_validate2);

var _Model2 = require('../Model.model');

var _Model3 = _interopRequireDefault(_Model2);

var _MarketingPreferenceConstraints = require('./MarketingPreference.constraints.json');

var _MarketingPreferenceConstraints2 = _interopRequireDefault(_MarketingPreferenceConstraints);

var _Response = require('../Response.model');

var _Response2 = _interopRequireDefault(_Response);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Define action specific error types
var ERROR_TYPES = exports.ERROR_TYPES = {
  VALIDATION_ERROR: new _Response2.default({}, 400, 'required fields are missing')
};

var MarketingPreference = function (_Model) {
  _inherits(MarketingPreference, _Model);

  /**
   * Message constructor
   * @param data object
   */
  function MarketingPreference() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, MarketingPreference);

    var _this = _possibleConstructorReturn(this, (MarketingPreference.__proto__ || Object.getPrototypeOf(MarketingPreference)).call(this));

    _this.firstname = null;
    _this.lastname = null;
    _this.phone = null;
    _this.mobile = null;
    _this.address1 = null;
    _this.address2 = null;
    _this.address3 = null;
    _this.town = null;
    _this.postcode = null;
    _this.country = null;
    _this.campaign = '';
    _this.transactionId = null;
    _this.transSource = '';
    _this.transSourceUrl = '';
    _this.transType = 'prefs';
    _this.email = null;
    _this.permissionPost = null;
    _this.permissionEmail = null;
    _this.permissionPhone = null;
    _this.permissionSMS = null;
    _this.timestamp = null;

    _this.instantiateFunctionWithDefinedValue('setFirstName', data.firstName);
    _this.instantiateFunctionWithDefinedValue('setFirstName', data.firstname);
    _this.instantiateFunctionWithDefinedValue('setLastName', data.lastName);
    _this.instantiateFunctionWithDefinedValue('setLastName', data.lastname);
    _this.instantiateFunctionWithDefinedValue('setPhone', data.phone);
    _this.instantiateFunctionWithDefinedValue('setMobile', data.mobile);
    _this.instantiateFunctionWithDefinedValue('setAddress1', data.address1);
    _this.instantiateFunctionWithDefinedValue('setAddress2', data.address2);
    _this.instantiateFunctionWithDefinedValue('setAddress3', data.address3);
    _this.instantiateFunctionWithDefinedValue('setTown', data.town);
    _this.instantiateFunctionWithDefinedValue('setPostcode', data.postcode);
    _this.instantiateFunctionWithDefinedValue('setCountry', data.country);
    _this.instantiateFunctionWithDefinedValue('setCampaign', data.campaign);
    _this.instantiateFunctionWithDefinedValue('setTransactionId', data.transactionId);
    _this.instantiateFunctionWithDefinedValue('setTransSource', data.transSource);
    _this.instantiateFunctionWithDefinedValue('setTransSourceUrl', data.transSourceUrl);
    _this.instantiateFunctionWithDefinedValue('setEmail', data.email);
    _this.instantiateFunctionWithDefinedValue('setPermissionPost', data.permissionPost);
    _this.instantiateFunctionWithDefinedValue('setPermissionEmail', data.permissionEmail);
    _this.instantiateFunctionWithDefinedValue('setPermissionPhone', data.permissionPhone);
    _this.instantiateFunctionWithDefinedValue('setPermissionSMS', data.permissionSMS);
    if (typeof data.timestamp !== 'undefined' && data.timestamp !== '' && data.timestamp !== null) {
      _this.instantiateFunctionWithDefinedValue('setTimestamp', data.timestamp);
    } else {
      _this.generateTimestamp();
    }
    return _this;
  }

  /**
   * Get First Name
   * @return {string|*}
   */


  _createClass(MarketingPreference, [{
    key: 'getFirstName',
    value: function getFirstName() {
      return this.firstname;
    }

    /**
     * Set First Name
     * @param value string
     */

  }, {
    key: 'setFirstName',
    value: function setFirstName(value) {
      this.firstname = value;
    }

    /**
     * Get Last Name
     * @return {string|*}
     */

  }, {
    key: 'getLastName',
    value: function getLastName() {
      return this.lastname;
    }

    /**
     * Set Last Name
     * @param value string
     */

  }, {
    key: 'setLastName',
    value: function setLastName(value) {
      this.lastname = value;
    }

    /**
     * Get phone
     * @return {string|*}
     */

  }, {
    key: 'getPhone',
    value: function getPhone() {
      return this.phone;
    }

    /**
     * Set phone
     * @param value string
     */

  }, {
    key: 'setPhone',
    value: function setPhone(value) {
      this.phone = value;
    }

    /**
     * Get Mobile
     * @return {string|*}
     */

  }, {
    key: 'getMobile',
    value: function getMobile() {
      return this.mobile;
    }

    /**
     * Set Mobile
     * @param value string
     */

  }, {
    key: 'setMobile',
    value: function setMobile(value) {
      this.mobile = value;
    }

    /**
     * Get Address Line 1
     * @return {string|*}
     */

  }, {
    key: 'getAddress1',
    value: function getAddress1() {
      return this.address1;
    }

    /**
     * Set Address Line 1
     * @param value string
     */

  }, {
    key: 'setAddress1',
    value: function setAddress1(value) {
      this.address1 = value;
    }

    /**
     * Get Address Line 2
     * @return {string|*}
     */

  }, {
    key: 'getAddress2',
    value: function getAddress2() {
      return this.address2;
    }

    /**
     * Set Address Line 2
     * @param value string
     */

  }, {
    key: 'setAddress2',
    value: function setAddress2(value) {
      this.address2 = typeof value === 'undefined' || value === '' ? null : value;
    }

    /**
     * Get Address Line 3
     * @return {string|*}
     */

  }, {
    key: 'getAddress3',
    value: function getAddress3() {
      return this.address3;
    }

    /**
     * Set Address Line 3
     * @param value string
     */

  }, {
    key: 'setAddress3',
    value: function setAddress3(value) {
      this.address3 = typeof value === 'undefined' || value === '' ? null : value;
    }

    /**
     * Get Town
     * @return {string|*}
     */

  }, {
    key: 'getTown',
    value: function getTown() {
      return this.town;
    }

    /**
     * Set Town
     * @param value string
     */

  }, {
    key: 'setTown',
    value: function setTown(value) {
      this.town = value;
    }

    /**
     * Get Postcode
     * @return {string|*}
     */

  }, {
    key: 'getPostcode',
    value: function getPostcode() {
      return this.postcode;
    }

    /**
     * Set Postcode
     * @param value string
     */

  }, {
    key: 'setPostcode',
    value: function setPostcode(value) {
      this.postcode = value;
    }

    /**
     * Get Country
     * @return {string|*}
     */

  }, {
    key: 'getCountry',
    value: function getCountry() {
      return this.country;
    }

    /**
     * Set Country
     * @param value string
     */

  }, {
    key: 'setCountry',
    value: function setCountry(value) {
      this.country = value;
    }

    /**
     * Get Campaign
     * @return {string|*}
     */

  }, {
    key: 'getCampaign',
    value: function getCampaign() {
      return this.campaign;
    }

    /**
     * Set Campaign
     * @param value string
     */

  }, {
    key: 'setCampaign',
    value: function setCampaign(value) {
      this.campaign = value;
    }

    /**
     * Get Transaction Id
     * @return {string|*}
     */

  }, {
    key: 'getTransactionId',
    value: function getTransactionId() {
      return this.transactionId;
    }

    /**
     * Set Transaction Id
     * @param value string
     */

  }, {
    key: 'setTransactionId',
    value: function setTransactionId(value) {
      this.transactionId = value;
    }

    /**
     * Get Transaction Source
     * @return {string|*}
     */

  }, {
    key: 'getTransSource',
    value: function getTransSource() {
      return this.transSource;
    }

    /**
     * Set Transaction Source
     * @param value string
     */

  }, {
    key: 'setTransSource',
    value: function setTransSource(value) {
      this.transSource = value;
    }

    /**
     * Get Transaction Source URL
     * @return {string|*}
     */

  }, {
    key: 'getTransSourceUrl',
    value: function getTransSourceUrl() {
      return this.transSourceUrl;
    }

    /**
     * Set Transaction Source URL
     * @param value string
     */

  }, {
    key: 'setTransSourceUrl',
    value: function setTransSourceUrl(value) {
      this.transSourceUrl = value;
    }

    /**
     * Get Transaction Type
     * @return {string|*}
     */

  }, {
    key: 'getTransType',
    value: function getTransType() {
      return this.transType;
    }

    /**
     * Set Transaction Type
     * @param value string
     */

  }, {
    key: 'setTransType',
    value: function setTransType(value) {
      this.transType = value;
    }

    /**
     * Get Email
     * @return {string|*}
     */

  }, {
    key: 'getEmail',
    value: function getEmail() {
      return this.email;
    }

    /**
     * Set Email
     * @param value string
     */

  }, {
    key: 'setEmail',
    value: function setEmail(value) {
      this.email = value;
    }

    /**
     * Get Email Permission
     * @return {string|*}
     */

  }, {
    key: 'getPermissionEmail',
    value: function getPermissionEmail() {
      return this.permissionEmail;
    }

    /**
     * Set Email Permission
     * @param value string
     */

  }, {
    key: 'setPermissionEmail',
    value: function setPermissionEmail(value) {
      this.permissionEmail = typeof value === 'undefined' || value === '' ? null : value;
    }

    /**
     * Get Post Permission
     * @return {string|*}
     */

  }, {
    key: 'getPermissionPost',
    value: function getPermissionPost() {
      return this.permissionPost;
    }

    /**
     * Set Post Permission
     * @param value string
     */

  }, {
    key: 'setPermissionPost',
    value: function setPermissionPost(value) {
      this.permissionPost = typeof value === 'undefined' || value === '' ? null : value;
    }

    /**
     * Get Phone Permission
     * @return {string|*}
     */

  }, {
    key: 'getPermissionPhone',
    value: function getPermissionPhone() {
      return this.permissionPhone;
    }

    /**
     * Set Phone Permission
     * @param value string
     */

  }, {
    key: 'setPermissionPhone',
    value: function setPermissionPhone(value) {
      this.permissionPhone = typeof value === 'undefined' || value === '' ? null : value;
    }

    /**
     * Get SMS Permission
     * @return {string|*}
     */

  }, {
    key: 'getPermissionSMS',
    value: function getPermissionSMS() {
      return this.permissionSMS;
    }

    /**
     * Set SMS Permission
     * @param value string
     */

  }, {
    key: 'setPermissionSMS',
    value: function setPermissionSMS(value) {
      this.permissionSMS = typeof value === 'undefined' || value === '' ? null : value;
    }

    /**
     * Get Timestamp
     * @return {string|*}
     */

  }, {
    key: 'getTimestamp',
    value: function getTimestamp() {
      return this.timestamp;
    }

    /**
     * Set Timestamp
     * @param value string
     */

  }, {
    key: 'setTimestamp',
    value: function setTimestamp(value) {
      this.timestamp = value;
    }

    /**
     * Generate Timestamp
     * @return {string|*}
     */

  }, {
    key: 'generateTimestamp',
    value: function generateTimestamp() {
      this.timestamp = Math.floor(Date.now() / 1000);
    }

    /**
     * Get Base entity mappings
     * @return {object}
     */

  }, {
    key: 'getEntityMappings',
    value: function getEntityMappings() {
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
        transactionId: this.getTransactionId(),
        transSource: this.getTransSource(),
        transSourceUrl: this.getTransSourceUrl(),
        transType: this.getTransType(),
        email: this.getEmail(),
        permissionEmail: this.getPermissionEmail(),
        permissionPost: this.getPermissionPost(),
        permissionPhone: this.getPermissionPhone(),
        permissionSMS: this.getPermissionSMS(),
        timestamp: this.getTimestamp()
      };
    }

    /**
     * Check if any permission is set
     * @returns {boolean}
     */

  }, {
    key: 'isPermissionSet',
    value: function isPermissionSet() {
      return this.getPermissionEmail() !== null && this.getPermissionEmail() !== '' || this.getPermissionPost() !== null && this.getPermissionPost() !== '' || this.getPermissionPhone() !== null && this.getPermissionPhone() !== '' || this.getPermissionSMS() !== null && this.getPermissionSMS() !== '';
    }

    /**
     * Validate the model
     * @return {Promise<any>}
     */

  }, {
    key: 'validate',
    value: function validate() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var requestConstraintsClone = Object.assign({}, _MarketingPreferenceConstraints2.default);
        if (_this2.getPermissionEmail() !== null && _this2.getPermissionEmail() !== '' && _this2.getPermissionEmail() !== '0' && _this2.getPermissionEmail() !== 0 || _this2.getEmail()) {
          if (_this2.getEmail()) {
            requestConstraintsClone.email = { email: true };
          } else {
            requestConstraintsClone.email = { presence: { allowEmpty: false }, email: true };
          }
        }
        // Update constraints if fields are not empty
        requestConstraintsClone.firstname = _this2.getFirstName() !== null && _this2.getFirstName() !== '' ? { format: { pattern: "[a-zA-Z.'-_ ]+", flags: 'i', message: 'can only contain alphabetical characters' } } : '';
        requestConstraintsClone.lastname = _this2.getLastName() !== null && _this2.getLastName() !== '' ? { format: { pattern: "[a-zA-Z.'-_ ]+", flags: 'i', message: 'can only contain alphabetical characters' } } : '';
        requestConstraintsClone.phone = _this2.getPhone() !== null && _this2.getPhone() !== '' ? { format: { pattern: '[0-9 ]+', flags: 'i', message: 'can only contain numerical characters' } } : '';
        requestConstraintsClone.mobile = _this2.getMobile() !== null && _this2.getMobile() !== '' ? { format: { pattern: '[0-9 ]+', flags: 'i', message: 'can only contain numerical characters' } } : '';
        requestConstraintsClone.address1 = _this2.getAddress1() !== null && _this2.getAddress1() !== '' ? { format: { pattern: "[a-zA-Z.'-_& ]+", flags: 'i', message: 'can only contain alphanumeric characters and . \' - _ &' } } : '';
        requestConstraintsClone.country = _this2.getCountry() !== null && _this2.getCountry() !== '' ? { format: { pattern: "[a-zA-Z.'-_& ]+", flags: 'i', message: 'can only contain alphabetical characters and . \' - _ &' } } : '';

        var validation = (0, _validate3.default)(_this2.getEntityMappings(), requestConstraintsClone);

        if (typeof validation === 'undefined') {
          return resolve();
        }

        var validationErrorResponse = ERROR_TYPES.VALIDATION_ERROR;
        validationErrorResponse.setBodyVariable('validation_errors', validation);

        return reject(validationErrorResponse);
      });
    }
  }]);

  return MarketingPreference;
}(_Model3.default);

exports.default = MarketingPreference;