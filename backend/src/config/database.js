const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const isTest = process.env.NODE_ENV === 'test';
const dbDialect = process.env.DB_DIALECT || (isTest ? 'sqlite' : 'mysql');
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'construction_db';

let sequelize;

if (dbDialect === 'sqlite' || isTest) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: isTest ? ':memory:' : path.join(__dirname, '../../database.sqlite'),
    logging: false,
    define: {
      timestamps: false,
      freezeTableName: true
    }
  });
} else {
  // MySQL connection
  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: false,
      freezeTableName: true
    }
  });
}

const getInitializedDb = async () => {
  try {
    await sequelize.authenticate();
    console.log(`[Database] Connected to ${sequelize.getDialect().toUpperCase()}`);
    return sequelize;
  } catch (error) {
    if (dbDialect === 'mysql') {
      console.warn(`[Database Warning] MySQL connection failed (${error.message}). To use MySQL, ensure MySQL Server is running on port 3306. For local testing without MySQL running, set DB_DIALECT=sqlite in backend/.env`);
    }
    throw error;
  }
};

module.exports = {
  sequelize,
  getInitializedDb
};
