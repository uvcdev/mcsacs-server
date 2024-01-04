import swaggerAutogen from 'swagger-autogen';
import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import fs, { exists } from 'fs';
import { ErrorClass, responseCode as resCode } from '../lib/resUtil';
const doc = {
  info: {
    title: 'MES API 문서',
    description: 'flexing-mes-server-2.0 문서 입니다.',
  },
  servers: [
    {
      url: 'http://220.90.131.48:3030',
    },
  ],
  schemes: ['http'],
  securityDefinitions: {
    ApiKeyAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'access-token',
    },
  },
};

const existSwaggerJsonFile = fs.existsSync(path.join(__dirname, '../swagger.json'));

const outputFile = path.join(__dirname, '../swagger.json');
const endpointsFiles = [path.join(__dirname, `../routes/*.ts`)];

// 이미 json파일이 있다면 autogen으로 만들지 않기
if (!existSwaggerJsonFile) swaggerAutogen(outputFile, endpointsFiles, doc);
