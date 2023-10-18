export type Status =
  | 'OK'
  | 'ACCEPTABLE_FAILURE'
  | 'APPLICATION_FAILURE';

export type ServiceStatus = {
  service: string;
  status: Status;
};
