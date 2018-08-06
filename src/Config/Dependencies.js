import LoggerService from '../Service/Logger.service';
import RequestService from '../Service/Request.service';

export const DEFINITIONS = {
  LOGGER: 'LOGGER',
  REQUEST: 'REQUEST',
};

export const DEPENDENCIES = {
  [DEFINITIONS.LOGGER]: LoggerService,
  [DEFINITIONS.REQUEST]: RequestService,
};

export default {
  DEFINITIONS,
  DEPENDENCIES,
};
