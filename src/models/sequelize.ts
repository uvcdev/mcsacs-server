import { Sequelize } from 'sequelize';
import { dbConfig, logDbConfig } from '../config/dbConfig';

// if (NODE_ENV설정에 따라 구분되는 경우에는 아래와 같이 처리 한다.)
// dotenv.config();
// const env = (process.env.NODE_ENV as 'production' | 'test' | 'development') || 'development';
// const { database, username, password, host, port, dialect } = dbConfig[env];

// else (NODE_ENV 설정에 따라 구분하지 않는 경우에는 아래와 같이 처리 한다.)
const { database, username, password, host, port, dialect } = dbConfig;

const sequelize = new Sequelize(database, username, password, {
  host,
  port,
  dialect,
  pool: {
    max: 15,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    options: {
      requestTimeout: 5000,
    },
  },
  logging: process.env.SEQUELIZE_LOGGING !== 'false',
});

const logSequelize = new Sequelize(logDbConfig.database, logDbConfig.username, logDbConfig.password, {
  host: logDbConfig.host,
  port: logDbConfig.port,
  dialect: logDbConfig.dialect,
  pool: {
    max: 15,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    options: {
      requestTimeout: 15000,
    },
  },
  logging: process.env.SEQUELIZE_LOGGING !== 'false',
});
export { sequelize, logSequelize };
export default sequelize;
