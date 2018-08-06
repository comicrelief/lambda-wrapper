import RequestService from '../Service/Request.service';

export const DEFINITIONS = {
  REQUEST: 'REQUEST',
};

export const DEPENDENCIES = {
  [DEFINITIONS.REQUEST]: RequestService,
};
