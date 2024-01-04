/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as schedule from 'node-schedule';
import { Request } from 'express';
import { RequestLog, logging, makeLogFormat } from './logging';

const req: RequestLog = {
  method: '',
  hostname: '',
  baseUrl: '',
  originalUrl: '',
  params: '',
  query: '',
  body: '',
};
const logFormat = makeLogFormat(req);
