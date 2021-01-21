/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable sonarjs/no-duplicate-string */
import ResponseModel from '../../../../src/Model/Response.model';
import MarketingPreferencesModel from '../../../../src/Model/SQS/MarketingPreference.model';

// Test definitions.
describe('Model/MarketingPreferencesModel', () => {
  describe('Ensure setting and getting of variables', () => {
    const mockedData = {
      firstname: 'Tim',
      lastname: 'Jones',
      phone: '0208 254 3062',
      mobile: '07917 321 492',
      address1: '32-36',
      address2: "St. Smith's Avenue",
      address3: '',
      town: 'London',
      postcode: 'sw184bx',
      country: 'United Kindgom',
      campaign: 'sr18',
      transactionId: 'AN129MNDJDJ',
      transSource: 'giftaid-sportrelief',
      transSourceUrl: 'https://giftaid.sportrelief.com/',
      transType: 'prefs',
      email: 'tim.jones@comicrelief.com',
      permissionEmail: 1,
      permissionPost: 0,
      permissionPhone: 0,
      permissionSMS: 0,
      timestamp: '1550841771',
    };

    const model = new MarketingPreferencesModel(mockedData);

    it('should set and get the firstname', () => {
      expect(model.getFirstName()).toEqual(mockedData.firstname);
    });

    it('should set and get the lastname', () => {
      expect(model.getLastName()).toEqual(mockedData.lastname);
    });

    it('should set and get the phone', () => {
      expect(model.getPhone()).toEqual(mockedData.phone);
    });

    it('should set and get the mobile', () => {
      expect(model.getMobile()).toEqual(mockedData.mobile);
    });

    it('should set and get the address1', () => {
      expect(model.getAddress1()).toEqual(mockedData.address1);
    });

    it('should set and get the address2', () => {
      expect(model.getAddress2()).toEqual(mockedData.address2);
    });

    it('should set and get the address3', () => {
      expect(model.getAddress3()).toEqual(null);
    });

    it('should set and get the town', () => {
      expect(model.getTown()).toEqual(mockedData.town);
    });

    it('should set and get the postcode', () => {
      expect(model.getPostcode()).toEqual(mockedData.postcode);
    });

    it('should set and get the country', () => {
      expect(model.getCountry()).toEqual(mockedData.country);
    });

    it('should set and get the campaign', () => {
      expect(model.getCampaign()).toEqual(mockedData.campaign);
    });

    it('should set and get the transaction id', () => {
      expect(model.getTransactionId()).toEqual(mockedData.transactionId);
    });

    it('should set and get the transSource', () => {
      expect(model.getTransSource()).toEqual(mockedData.transSource);
    });

    it('should set and get the transSourceUrl', () => {
      expect(model.getTransSourceUrl()).toEqual(mockedData.transSourceUrl);
    });

    it('should set and get the transType', () => {
      expect(model.getTransType()).toEqual(mockedData.transType);
    });

    it('should set and get the email', () => {
      expect(model.getEmail()).toEqual(mockedData.email);
    });

    it('should set and get the permissionEmail', () => {
      expect(model.getPermissionEmail()).toEqual(mockedData.permissionEmail);
    });

    it('should set and get the permissionPost', () => {
      expect(model.getPermissionPost()).toEqual(mockedData.permissionPost);
    });

    it('should set and get the permissionPhone', () => {
      expect(model.getPermissionPhone()).toEqual(mockedData.permissionPhone);
    });

    it('should set and get the permissionSMS', () => {
      expect(model.getPermissionSMS()).toEqual(mockedData.permissionSMS);
    });

    it('should set and get the Timestamp', () => {
      expect(model.getTimestamp()).toEqual(mockedData.timestamp);
    });

    it('should validate the model', (done) => {
      model
        .validate()
        .then(() => {
          expect(true).toEqual(true);
          done();
        })
        .catch(() => {
          expect(true).toEqual(false);
          done();
        });
    });
  });

  describe('Ensure validation fails when variables are not correctly set', () => {
    const mockedData = {};

    const model = new MarketingPreferencesModel(mockedData);

    it('should validate the model and return an error response', (done) => {
      model
        .validate()
        .then(() => {
          expect(true).toEqual(false);
          done();
        })
        .catch((error) => {
          expect(error instanceof ResponseModel).toEqual(true);
          expect(error.getCode()).toEqual(400);
          expect(error.body.message).toEqual('required fields are missing');
          expect(true).toEqual(true);
          done();
        });
    });
  });

  describe('Ensure validation fails when email permission is set and no email is provided', () => {
    const mockedData = {
      firstname: 'Tim',
      lastname: 'Jones',
      mobile: '07917 321 492',
      address1: '32-36',
      address2: "St. Smith's Avenue",
      address3: '',
      town: 'London',
      postcode: 'sw184bx',
      country: 'United Kindgom',
      campaign: 'sr18',
      transactionId: 'AN129MNDJDJ',
      transSource: 'giftaid-sportrelief',
      transSourceUrl: 'https://giftaid.sportrelief.com/',
      transType: 'prefs',
      permissionEmail: 1,
      permissionPost: 0,
      permissionPhone: 0,
      permissionSMS: 0,
      timestamp: '1550841771',
    };

    const model = new MarketingPreferencesModel(mockedData);

    it('should validate the model and return an error response', (done) => {
      model
        .validate()
        .then(() => {
          expect(true).toEqual(false);
          done();
        })
        .catch((error) => {
          expect(error instanceof ResponseModel).toEqual(true);
          expect(error.getCode()).toEqual(400);
          expect(error.body.validation_errors.email[0]).toEqual("Email can't be blank");
          expect(true).toEqual(true);
          done();
        });
    });
  });

  describe('Ensure validation fails when email permission is set and invalid email is provided', () => {
    const mockedData = {
      firstname: 'Tim',
      lastname: 'Jones',
      phone: '0208 254 3062',
      mobile: '07917 321 492',
      address1: '32-36',
      address2: "St. Smith's Avenue",
      address3: '',
      town: 'London',
      postcode: 'sw184bx',
      country: 'United Kindgom',
      campaign: 'sr18',
      transactionId: 'AN129MNDJDJ',
      transSource: 'giftaid-sportrelief',
      transSourceUrl: 'https://giftaid.sportrelief.com/',
      transType: 'prefs',
      email: 'tim@',
      permissionEmail: 1,
      permissionPost: 0,
      permissionPhone: 0,
      permissionSMS: 0,
    };

    const model = new MarketingPreferencesModel(mockedData);

    it('should validate the model and return an error response', (done) => {
      model
        .validate()
        .then(() => {
          expect(true).toEqual(false);
          done();
        })
        .catch((error) => {
          expect(error instanceof ResponseModel).toEqual(true);
          expect(error.getCode()).toEqual(400);
          expect(error.body.validation_errors.email[0]).toEqual('Email is not a valid email');
          expect(true).toEqual(true);
          done();
        });
    });
  });

  describe('Ensure validation passes when permissions are not set', () => {
    const mockedData = {
      firstname: 'Kelvin',
      lastname: 'James',
      phone: '0208 254 3062',
      mobile: '07425253522',
      address1: 'COMIC RELIEF',
      address2: 'CAMELFORD HOUSE 87-90',
      address3: 'ALBERT EMBANKMENT',
      town: 'LONDON',
      postcode: 'SE1 7TP',
      country: 'GB',
      campaign: 'RND19',
      transactionId: 'AN129MNDJDJ',
      transSource: 'RND19_GiftAid',
      transSourceUrl: 'https://giftaid.sportrelief.com/',
      transType: 'prefs',
      confirm: 1,
      permissionEmail: null,
      permissionPost: null,
      permissionPhone: null,
      permissionSMS: null,
      timestamp: '1562165588',
    };

    const model = new MarketingPreferencesModel(mockedData);

    it('should validate the model', (done) => {
      model
        .validate()
        .then(() => {
          expect(true).toEqual(true);
          done();
        })
        .catch((error) => {
          console.log('Error:', error);
          expect(true).toEqual(false);
          done();
        });
    });
  });

  describe('Ensure validation passes when email permission is NO', () => {
    const mockedData = {
      firstname: 'Kelvin',
      lastname: 'James',
      phone: '0208 254 3062',
      mobile: '07425253522',
      address1: 'COMIC RELIEF',
      address2: 'CAMELFORD HOUSE 87-90',
      address3: 'ALBERT EMBANKMENT',
      town: 'LONDON',
      postcode: 'SE1 7TP',
      country: 'GB',
      campaign: 'RND19',
      transactionId: 'AN129MNDJDJ',
      transSource: 'RND19_GiftAid',
      transSourceUrl: 'https://giftaid.sportrelief.com/',
      transType: 'prefs',
      confirm: 1,
      permissionEmail: 0,
      permissionPost: null,
      permissionPhone: null,
      permissionSMS: null,
      timestamp: '1562165588',
    };

    const model = new MarketingPreferencesModel(mockedData);

    it('should validate the model', (done) => {
      model
        .validate()
        .then(() => {
          expect(true).toEqual(true);
          done();
        })
        .catch((error) => {
          console.log('Error:', error);
          expect(true).toEqual(false);
          done();
        });
    });
  });

  describe('Ensure generating of timestamp when not set', () => {
    const mockedData = {
      firstname: 'Tim',
      lastname: 'Jones',
      phone: '0208 254 3062',
      mobile: '07917 321 492',
      address1: '32-36',
      address2: "St. Smith's Avenue",
      address3: '',
      town: 'London',
      postcode: 'sw184bx',
      country: 'United Kindgom',
      campaign: 'sr18',
      transactionId: 'AN129MNDJDJ',
      transSource: 'giftaid-sportrelief',
      transSourceUrl: 'https://giftaid.sportrelief.com/',
      transType: 'prefs',
      email: 'tim.jones@comicrelief.com',
      permissionEmail: 1,
      permissionPost: 0,
      permissionPhone: 0,
      permissionSMS: 0,
    };

    const model = new MarketingPreferencesModel(mockedData);

    it('should get a timestamp', () => {
      expect(model.getTimestamp() > 0).toEqual(true);
    });

    it('should validate the model', (done) => {
      model
        .validate()
        .then(() => {
          expect(true).toEqual(true);
          done();
        })
        .catch(() => {
          expect(true).toEqual(false);
          done();
        });
    });
  });

  describe('Ensure validation passes when nullable fields are not present', () => {
    const mockedData = {
      firstname: 'Tim',
      lastname: 'Jones',
      phone: '0208 254 3062',
      mobile: '07917 321 492',
      address1: "32 Smith's Avenue",
      town: 'London',
      postcode: 'sw184bx',
      country: 'United Kindgom',
      campaign: 'sr18',
      transSource: 'giftaid-sportrelief',
      transSourceUrl: 'https://giftaid.sportrelief.com/',
      transType: 'prefs',
      email: '',
    };

    const model = new MarketingPreferencesModel(mockedData);

    it('should validate the model', (done) => {
      model
        .validate()
        .then(() => {
          expect(true).toEqual(true);
          done();
        })
        .catch((error) => {
          console.log('Error:', error);
          expect(true).toEqual(false);
          done();
        });
    });
  });

  describe('Ensure model permission evaluates to false when no permission is set', () => {
    const mockedData = {
      firstname: 'Tim',
      lastname: 'Jones',
      phone: '0208 254 3062',
      mobile: '07917 321 492',
      address1: "32 Smith's Avenue",
      town: 'London',
      postcode: 'sw184bx',
      country: 'United Kindgom',
      campaign: 'sr18',
      transSource: 'giftaid-sportrelief',
      transSourceUrl: 'https://giftaid.sportrelief.com/',
      transType: 'prefs',
      email: '',
      permissionEmail: '',
      permissionPost: '',
      permissionPhone: '',
      permissionSMS: '',
    };

    const model = new MarketingPreferencesModel(mockedData);

    it('should evaluate model permissions to false', (done) => {
      expect(model.isPermissionSet()).toEqual(false);
      done();
    });
  });

  describe('Ensure model permission evaluates to true when at least one permission is set', () => {
    const mockedData = {
      firstname: 'Tim',
      lastname: 'Jones',
      phone: '0208 254 3062',
      mobile: '07917 321 492',
      address1: "32 Smith's Avenue",
      town: 'London',
      postcode: 'sw184bx',
      country: 'United Kindgom',
      campaign: 'sr18',
      transactionId: 'AN129MNDJDJ',
      transSource: 'giftaid-sportrelief',
      transSourceUrl: 'https://giftaid.sportrelief.com/',
      transType: 'prefs',
      email: 'tim@example.com',
      permissionEmail: 1,
      permissionPost: '',
      permissionPhone: '',
      permissionSMS: '',
    };

    const model = new MarketingPreferencesModel(mockedData);

    it('should evaluate model permissions to true', (done) => {
      expect(model.isPermissionSet()).toEqual(true);
      done();
    });
  });
});
