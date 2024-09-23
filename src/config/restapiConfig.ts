import * as dotenv from 'dotenv';
dotenv.config();

type RestapiConfig = {
  host: string;
  port: number;
  id: string;
  pass: string;
};

const firstFloorRestapiConfig: RestapiConfig = {
  host: process.env.FIRST_ACS_RESTAPI_HOST || '',
  port: Number(process.env.ACS_RESTAPI_PORT || '3000'),
  id: process.env.ACS_RESTAPI_ID || 'system',
  pass: process.env.ACS_RESTAPI_PASS || '',
};

const secondFloorRestapiConfig: RestapiConfig = {
  host: process.env.SECOND_ACS_RESTAPI_HOST || '',
  port: Number(process.env.ACS_RESTAPI_PORT || '3000'),
  id: process.env.ACS_RESTAPI_ID || 'system',
  pass: process.env.ACS_RESTAPI_PASS || '',
};
export { firstFloorRestapiConfig, secondFloorRestapiConfig };
