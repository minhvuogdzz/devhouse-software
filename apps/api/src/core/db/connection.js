import mongoose from 'mongoose';
import { config } from '../../config/index.js';
import { logger } from '../logger/index.js';

let isConnected = false;

export const connectDB = async (uri = config.MONGODB_URI, dbName = config.MONGODB_DB_NAME) => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Safety net: a test run may only ever connect to a database whose name contains "test".
  if (config.NODE_ENV === 'test' && !/test/i.test(dbName)) {
    throw new Error(
      `Refusing to connect tests to database "${dbName}". Tests must use an isolated test database.`,
    );
  }

  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn.connection;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

export const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected');
  }
};

export const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

export { mongoose };
