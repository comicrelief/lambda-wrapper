import HTTPService from '../Service/HTTP.service';
import LoggerService from '../Service/Logger.service';
import RequestService from '../Service/Request.service';
import SQSService from '../Service/SQS.service';
import TimerService from '../Service/Timer.service';

export const DEFINITIONS = {
  HTTP: 'HTTP',
  LOGGER: 'LOGGER',
  REQUEST: 'REQUEST',
  SQS: 'SQS',
  TIMER: 'TIMER',
};

export const DEPENDENCIES = {
  [DEFINITIONS.HTTP]: HTTPService,
  [DEFINITIONS.LOGGER]: LoggerService,
  [DEFINITIONS.REQUEST]: RequestService,
  [DEFINITIONS.SQS]: SQSService,
  [DEFINITIONS.TIMER]: TimerService,
};

export default {
  DEFINITIONS,
  DEPENDENCIES,
};
