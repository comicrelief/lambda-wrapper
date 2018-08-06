/*
import ServerlessMochaPlugin from 'serverless-mocha-plugin';
import ResponseModel, { DEFAULT_MESSAGE, RESPONSE_HEADERS } from '../../src/Model/Response.model';

const expect = ServerlessMochaPlugin.chai.expect;

describe('Model/Response.model', () => {

  it('should return the expected headers', () => {
    const response = new ResponseModel({}, 500);
    expect(response.generate().headers).to.eql(RESPONSE_HEADERS);
  });

  describe('ensure body set correctly', () => {

    it('should set the body data from the constructor', () => {
      const response = new ResponseModel({ test: 123 }, 500);

      const responseBody = response.generate();

      expect(typeof responseBody.body).to.eql('string');
      expect(responseBody.body.indexOf("123")).to.not.eql(-1);
      expect(JSON.parse(responseBody.body).data.test).to.eql(123);
    });

    it('should be able to modify the body data', () => {
      const response = new ResponseModel({ test: 123 }, 500);

      response.setData({ test: 234 });
      const responseBody = response.generate();

      expect(typeof responseBody.body).to.eql('string');
      expect(responseBody.body.indexOf("234")).to.not.eql(-1);
      expect(JSON.parse(responseBody.body).data.test).to.eql(234);
    });

  });

  describe('ensure status codes are set correctly', () => {

    it('should return the 200 status code that is supplied to it', () => {
      const response = new ResponseModel({}, 200);
      expect(response.generate().statusCode).to.eql(200);
    });

    it('should return the 500 status code that is supplied to it', () => {
      const response = new ResponseModel({}, 500);
      expect(response.generate().statusCode).to.eql(500);
    });

    it('should allow the status code to be modified once set via the constructor', () => {
      const response = new ResponseModel({}, 200);
      response.setCode(300);

      expect(response.generate().statusCode).to.eql(300);
    });

  });

  describe('ensure messages are set correctly', () => {

    it('should return a message field when a message is supplied to it', () => {
      const message = 'test 123';
      const response = new ResponseModel({}, 500, message);
      expect(JSON.parse(response.generate().body).message).to.eql(message);
    });

    it('should be able to get the message using the message getter', () => {
      const message = 'test 123';
      const response = new ResponseModel({}, 500, message);
      expect(response.getMessage()).to.eql(message);
    });

    it('should return success message field when a message is not supplied to it', () => {
      const response = new ResponseModel({}, 500);
      expect(JSON.parse(response.generate().body).message).to.eql(DEFAULT_MESSAGE);
    });

    it('should allow the message supplied via the constructor to be overridden', () => {
      const response = new ResponseModel({}, 200, 'replace-me');
      response.setMessage('test');

      expect(JSON.parse(response.generate().body).message).to.eql('test');
    });

  });

});
*/
