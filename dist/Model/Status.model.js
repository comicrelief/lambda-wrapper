'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.STATUS_TYPES = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Model2 = require('./Model.model');

var _Model3 = _interopRequireDefault(_Model2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var STATUS_TYPES = exports.STATUS_TYPES = {
  OK: 'OK',
  ACCEPTABLE_FAILURE: 'ACCEPTABLE_FAILURE',
  APPLICATION_FAILURE: 'APPLICATION_FAILURE'
};

/**
 * StatusModel Class
 */

var StatusModel = function (_Model) {
  _inherits(StatusModel, _Model);

  /**
   * StatusModel constructor
   * @param service
   * @param status
   */
  function StatusModel(service, status) {
    _classCallCheck(this, StatusModel);

    var _this = _possibleConstructorReturn(this, (StatusModel.__proto__ || Object.getPrototypeOf(StatusModel)).call(this));

    _this.setService(service);
    _this.setStatus(status);
    return _this;
  }

  /**
   * Get Service
   * @return {*}
   */


  _createClass(StatusModel, [{
    key: 'getService',
    value: function getService() {
      return this.service;
    }

    /**
     * Set Service
     * @param service
     */

  }, {
    key: 'setService',
    value: function setService(service) {
      this.service = service;
    }

    /**
     * Set the status
     * @param status
     */

  }, {
    key: 'setStatus',
    value: function setStatus(status) {
      if (typeof STATUS_TYPES[status] === 'undefined') {
        throw new Error(StatusModel.name + ' - ' + status + ' is not a valid status type');
      }

      this.status = status;
    }

    /**
     * Get status
     * @return {string|*}
     */

  }, {
    key: 'getStatus',
    value: function getStatus() {
      return this.status;
    }
  }]);

  return StatusModel;
}(_Model3.default);

exports.default = StatusModel;