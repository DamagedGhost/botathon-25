const dotenv = require('dotenv');
dotenv.config();

const dbProvider = process.env.DB_PROVIDER || 'memory';

const sql = {
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  server: process.env.DB_SERVER || '',
  database: process.env.DB_NAME || 'master',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

const jwtSecret = process.env.JWT_SECRET || 'dev-secret';

module.exports = { dbProvider, sql, jwtSecret };
