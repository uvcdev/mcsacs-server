import * as dotenv from 'dotenv';
dotenv.config();

type DBConfig = {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql';
};

const dbConfig: DBConfig = {
  username: process.env.DB_ID || '',
  password: process.env.DB_PASS || '',
  database: process.env.DB_DATABASE || '',
  host: process.env.DB_HOST || '',
  port: Number(process.env.DB_PORT || '5432'),
  dialect: process.env.DB_DIALECT as 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql',
};

export default dbConfig;
