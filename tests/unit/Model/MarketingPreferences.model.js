import ServerlessMochaPlugin from 'serverless-mocha-plugin';
import MarketingPreferencesModel from '../../../src/Model/MarketingPreference.model';

const expect = ServerlessMochaPlugin.chai.expect;

// Test definitions.
describe('Model/MarketingPreferencesModel', () => {

  describe('Ensure setting and getting of variables', () => {


    const mockedData = {
      firstname: 'Tim',
      lastname: 'Jones',
      phone: '0208 254 3062',
      mobile: '07917 321 492',
      address1: '32-36',
      address2: 'St. Smith\'s Avenue',
      address3: '',
      town: 'London',
      postcode: 'sw184bx',
      country: 'United Kindgom',
      campaign: 'sr18',
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

    it('should set and get the firstname', () => {
      expect(model.getFirstName()).to.eql(mockedData.firstname);
    });

    it('should set and get the lastname', () => {
      expect(model.getLastName()).to.eql(mockedData.lastname);
    });

    it('should set and get the phone', () => {
      expect(model.getPhone()).to.eql(mockedData.phone);
    });

    it('should set and get the mobile', () => {
      expect(model.getMobile()).to.eql(mockedData.mobile);
    });

    it('should set and get the address1', () => {
      expect(model.getAddress1()).to.eql(mockedData.address1);
    });

    it('should set and get the address2', () => {
      expect(model.getAddress2()).to.eql(mockedData.address2);
    });

    it('should set and get the address3', () => {
      expect(model.getAddress3()).to.eql(mockedData.address3);
    });

    it('should set and get the town', () => {
      expect(model.getTown()).to.eql(mockedData.town);
    });

    it('should set and get the postcode', () => {
      expect(model.getPostcode()).to.eql(mockedData.postcode);
    });

    it('should set and get the country', () => {
      expect(model.getCountry()).to.eql(mockedData.country);
    });

    it('should set and get the campaign', () => {
      expect(model.getCampaign()).to.eql(mockedData.campaign);
    });

    it('should set and get the transSource', () => {
      expect(model.getTransSource()).to.eql(mockedData.transSource);
    });

    it('should set and get the transSourceUrl', () => {
      expect(model.getTransSourceUrl()).to.eql(mockedData.transSourceUrl);
    });

    it('should set and get the transType', () => {
      expect(model.getTransType()).to.eql(mockedData.transType);
    });

    it('should set and get the email', () => {
      expect(model.getEmail()).to.eql(mockedData.email);
    });

    it('should set and get the permissionEmail', () => {
      expect(model.getPermissionEmail()).to.eql(mockedData.permissionEmail);
    });

    it('should set and get the permissionPost', () => {
      expect(model.getPermissionPost()).to.eql(mockedData.permissionPost);
    });

    it('should set and get the permissionPhone', () => {
      expect(model.getPermissionPhone()).to.eql(mockedData.permissionPhone);
    });

    it('should set and get the permissionSMS', () => {
      expect(model.getPermissionSMS()).to.eql(mockedData.permissionSMS);
    });
  });
});
