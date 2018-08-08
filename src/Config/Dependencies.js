import LoggerService from '../Service/Logger.service';
import RequestService from '../Service/Request.service';
import SQSService from '../Service/SQS.service';

export const DEFINITIONS = {
  LOGGER: 'LOGGER',
  REQUEST: 'REQUEST',
  SQS: 'SQS',
};

export const DEPENDENCIES = {
  [DEFINITIONS.LOGGER]: LoggerService,
  [DEFINITIONS.REQUEST]: RequestService,
  [DEFINITIONS.SQS]: SQSService,
};

export default {
  DEFINITIONS,
  DEPENDENCIES,
};
