import { DEFAULT_MESSAGE, RESPONSE_HEADERS } from '@/src/models/ResponseModel';

import { ResponseModel } from '@/src';

describe('unit.models.ResponseModel', () => {
  describe('headers', () => {
    it('should include the default response headers', () => {
      const response = new ResponseModel({}, 500);
      expect(response.generate().headers).toEqual(RESPONSE_HEADERS);
    });
  });

  describe('body', () => {
    it('should set the body data from the constructor', () => {
      const response = new ResponseModel({ test: 123 }, 500);

      const responseBody = response.generate();

      expect(typeof responseBody.body).toEqual('string');
      expect(responseBody.body).toContain('123');
      expect(JSON.parse(responseBody.body)).toHaveProperty('data.test', 123);
    });

    it('should modify the body data using setData', () => {
      const response = new ResponseModel({ test: 123 }, 500);

      response.setData({ test: 234 });
      const responseBody = response.generate();

      expect(typeof responseBody.body).toEqual('string');
      expect(responseBody.body).toContain('234');
      expect(JSON.parse(responseBody.body)).toHaveProperty('data.test', 234);
    });
  });

  describe('status code', () => {
    it('should return a 200 status code that is supplied to it', () => {
      const response = new ResponseModel({}, 200);
      expect(response.generate().statusCode).toEqual(200);
    });

    it('should return a 500 status code that is supplied to it', () => {
      const response = new ResponseModel({}, 500);
      expect(response.generate().statusCode).toEqual(500);
    });

    it('should modify the status code using setCode', () => {
      const response = new ResponseModel({}, 200);
      response.setCode(300);

      expect(response.generate().statusCode).toEqual(300);
    });
  });

  describe('message', () => {
    it('should put a message field in the body', () => {
      const message = 'test 123';
      const response = new ResponseModel({}, 500, message);
      expect(JSON.parse(response.generate().body)).toHaveProperty('message', message);
    });

    it('should be able to get the message using getMessage', () => {
      const message = 'test 123';
      const response = new ResponseModel({}, 500, message);
      expect(response.getMessage()).toEqual(message);
    });

    it('should return success message if no message is given', () => {
      const response = new ResponseModel({}, 500);
      expect(JSON.parse(response.generate().body).message).toEqual(DEFAULT_MESSAGE);
    });

    it('should modify the message using setMessage', () => {
      const response = new ResponseModel({}, 200, 'replace-me');
      response.setMessage('test');

      expect(JSON.parse(response.generate().body).message).toEqual('test');
    });
  });

  describe('generate', () => {
    it('should output the same from the static and instance method', () => {
      const data = { a: 1, b: { c: 2 } };
      const code = 201;
      const message = 'Some message';

      const response1 = new ResponseModel(data, code, message).generate();
      const response2 = ResponseModel.generate(data, code, message);

      expect(response1).toEqual(response2);
    });
  });
});
