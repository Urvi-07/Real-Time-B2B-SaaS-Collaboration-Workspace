import mongoose from 'mongoose';
import { config } from '../config/config';
import { logger } from '../logging/logger';

/**
 * Establishes a connection to the MongoDB database.
 * If the connection cannot be established, logs the error and terminates the process.
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = config.DATABASE_URL;

    // Set up connection event listeners before initiating connection
    mongoose.connection.on('connected', () => {
      logger.info('🔌 Mongoose default connection open to database');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('❌ Mongoose default connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ Mongoose default connection disconnected');
    });

    logger.info('⏳ Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    logger.info('🎉 Successfully connected to MongoDB.');
  } catch (error) {
    logger.error('💥 Failed to connect to MongoDB on startup:', error);
    process.exit(1);
  }
};

/**
 * Closes the MongoDB connection cleanly.
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('🔌 Mongoose default connection closed successfully.');
  } catch (error) {
    logger.error('💥 Error closing Mongoose connection:', error);
  }
};
