import * as dotenv from 'dotenv';
dotenv.config();

type RestapiConfig = {
  host: string;
  port: number;
  id: string;
  pass: string;
};

const restapiConfig: RestapiConfig = {
  host: process.env.ACS_RESTAPI_HOST || '',
  port: Number(process.env.ACS_RESTAPI_PORT || '3000'),
  id: process.env.ACS_RESTAPI_ID || 'system',
  pass: process.env.ACS_RESTAPI_PASS || '',
};

export { restapiConfig };
