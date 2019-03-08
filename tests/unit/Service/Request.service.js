import ServerlessMochaPlugin from 'serverless-mocha-plugin';
import QueryString from 'querystring';
import DependencyInjection from '../../../src/DependencyInjection/DependencyInjection.class';

import RequestService, { REQUEST_TYPES } from '../../../src/Service/Request.service';
import CONFIGURATION from "../../../src/Config/Dependencies";

const expect = ServerlessMochaPlugin.chai.expect;

let getEvent = require('../../mocks/aws/event.json');
let getContext = require('../../mocks/aws/context.json');

describe('Service/RequestService', () => {

  describe('test GET request getter', () => {

    let testEvent = Object.assign({}, getEvent);
    testEvent.queryStringParameters.test = 123;

    it('should fetch a GET parameter from an AWS event', () => {
      let request = new RequestService(new DependencyInjection(CONFIGURATION, testEvent, getContext));
      expect(request.get('test')).to.eql(getEvent.queryStringParameters.test);
    });

    it('should fetch a GET parameter from an AWS event when the request type is set', () => {
      let request = new RequestService(new DependencyInjection(CONFIGURATION, testEvent, getContext));
      expect(request.get('test'), null, REQUEST_TYPES.GET).to.eql(getEvent.queryStringParameters.test);
    });

    it('should return null from a non existent GET parameter from an AWS event', () => {
      let request = new RequestService(new DependencyInjection(CONFIGURATION, testEvent, getContext));
      expect(request.get('fake')).to.eql(null);
    });

    it('should return null from a non existent GET parameter from an AWS event when the request type is set', () => {
      let request = new RequestService(new DependencyInjection(CONFIGURATION, testEvent, getContext));
      expect(request.get('fake', null, REQUEST_TYPES.GET)).to.eql(null);
    });

    it('should return a prettified user agent', () => {
      let request = new RequestService(new DependencyInjection(CONFIGURATION, testEvent, getContext));
      expect(request.getUserBrowserAndDevice()).to.eql({
        'browser-type': 'Safari',
        'browser-version': '9.1.1',
        'device-type': 'Other',
        'operating-system': 'Mac OS X',
        'operating-system-version': '10.11.5'
      });
    });

  });

  describe('test POST request getter', () => {

    let testEvent = Object.assign({}, getEvent);
    testEvent.httpMethod = 'POST';
    testEvent.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    testEvent.body = 'grant_type=client_credentials&response_type=token&token_format=opaque';

    let queryParams = QueryString.parse(testEvent.body);

    it('should fetch a POST parameter from an AWS event', () => {
      let request = new RequestService(new DependencyInjection(CONFIGURATION, testEvent, getContext));
      expect(request.get('grant_type')).to.eql(queryParams['grant_type']);
    });

    it('should fetch a POST parameter from an AWS event when the request type is set', () => {
      let request = new RequestService(new DependencyInjection(CONFIGURATION, testEvent, getContext));
      expect(request.get('grant_type'), null, REQUEST_TYPES.POST).to.eql(queryParams['grant_type']);
    });

    it('should return null from a non existent POST parameter from an AWS event', () => {
      let request = new RequestService(new DependencyInjection(CONFIGURATION, testEvent, getContext));
      expect(request.get('fake')).to.eql(null);
    });

    it('should return null from a non existent POST parameter from an AWS event when the request type is set', () => {
      let request = new RequestService(new DependencyInjection(CONFIGURATION, testEvent, getContext), getEvent);
      expect(request.get('fake', null, REQUEST_TYPES.POST)).to.eql(null);
    });

  });

  describe('test GET request get all getter', () => {

    let testEvent = Object.assign({}, getEvent);
    testEvent.queryStringParameters.test = 123;
    testEvent.queryStringParameters.testTwo = 123;

    it('should return all get parameters as an array', () => {
      let request = new RequestService(new DependencyInjection(CONFIGURATION, testEvent, getContext));
      expect(request.getAll()).to.eql(testEvent.queryStringParameters);
    });

  });

  describe('test POST request get all getter', () => {

    let testEvent = Object.assign({}, getEvent);
    testEvent.httpMethod = 'POST';
    testEvent.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    testEvent.body = 'grant_type=client_credentials&response_type=token&token_format=opaque';

    let queryParams = QueryString.parse(testEvent.body);

    it('should return all post parameters as an array', () => {
      let request = new RequestService(new DependencyInjection(CONFIGURATION, testEvent, getContext));
      expect(request.getAll()).to.eql(queryParams);
    });

  });

  describe('test request validation', () => {

    let testEvent = Object.assign({}, getEvent);
    let constraints = {
      "giftaid": {
        "numericality": true,
      }
    };

    describe('test validation against GET request', () => {

      it('should resolve if there are no validation errors', (done) => {
        testEvent.queryStringParameters.giftaid = 123;
        let request = new RequestService(new DependencyInjection(CONFIGURATION, testEvent, getContext));

        request.validateAgainstConstraints(constraints)
          .then(() => {
            expect(true).to.eql(true);
            done();
          })
          .catch(() => {
            expect(true).to.eql(false);
            done();
          });

      });

      it('should return a response containing validation errors if the data provided is incorrect', (done) => {
        testEvent.queryStringParameters.giftaid = 'abc';
        let request = new RequestService(new DependencyInjection(CONFIGURATION, testEvent, getContext));

        request.validateAgainstConstraints(constraints)
          .then(() => {
            expect(true).to.eql(false);
            done();
          })
          .catch(() => {
            expect(true).to.eql(true);
            done();
          });
      });

    });

    describe('test validation against POST request', () => {

      testEvent.httpMethod = 'POST';
      testEvent.headers['Content-Type'] = 'application/x-www-form-urlencoded';

      it('should resolve if there are no validation errors', (done) => {

        testEvent.body = 'giftaid=123';
        let request = new RequestService(new DependencyInjection(CONFIGURATION, testEvent, getContext));

        request.validateAgainstConstraints(constraints)
          .then(() => {
            expect(true).to.eql(true);
            done();
          })
          .catch(() => {
            expect(true).to.eql(false);
            done();
          });

      });

      it('should return a response containing validation errors if the data provided is incorrect', (done) => {

        testEvent.body = 'giftaid=abc';
        let request = new RequestService(new DependencyInjection(CONFIGURATION, testEvent, getContext));

        request.validateAgainstConstraints(constraints)
          .then(() => {
            expect(true).to.eql(false);
            done();
          })
          .catch(() => {
            expect(true).to.eql(true);
            done();
          });

      });

    });

  });

});
