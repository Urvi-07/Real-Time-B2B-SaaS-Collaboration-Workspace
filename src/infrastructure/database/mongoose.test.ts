import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from './mongoose';
import { logger } from '../logging/logger';

// Mock mongoose structure
jest.mock('mongoose', () => {
  return {
    connect: jest.fn(),
    disconnect: jest.fn(),
    connection: {
      on: jest.fn(),
    },
  };
});

// Mock logger
jest.mock('../logging/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('MongoDB Connection Utility', () => {
  let mockExit: jest.SpyInstance;
  let listeners: { [key: string]: (...args: unknown[]) => void };

  beforeEach(() => {
    listeners = {};
    
    // Set up mock implementation for connection.on
    (mongoose.connection.on as jest.Mock).mockImplementation((event: string, cb: (...args: unknown[]) => void) => {
      listeners[event] = cb;
    });

    // Spy on process.exit and mock it to throw an error so the test runner doesn't exit
    mockExit = jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit called with ${code}`);
    });
  });

  afterEach(() => {
    mockExit.mockRestore();
  });

  describe('connectDatabase', () => {
    it('should connect to MongoDB successfully and set up event listeners', async () => {
      (mongoose.connect as jest.Mock).mockResolvedValueOnce(mongoose);

      await connectDatabase();

      expect(mongoose.connect).toHaveBeenCalled();
      expect(mongoose.connection.on).toHaveBeenCalledWith('connected', expect.any(Function));
      expect(mongoose.connection.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mongoose.connection.on).toHaveBeenCalledWith('disconnected', expect.any(Function));
      expect(logger.info).toHaveBeenCalledWith('⏳ Connecting to MongoDB...');
      expect(logger.info).toHaveBeenCalledWith('🎉 Successfully connected to MongoDB.');
    });

    it('should log an event when connection is established', async () => {
      (mongoose.connect as jest.Mock).mockResolvedValueOnce(mongoose);

      await connectDatabase();

      // Trigger the 'connected' event
      if (listeners['connected']) {
        listeners['connected']();
      }

      expect(logger.info).toHaveBeenCalledWith('🔌 Mongoose default connection open to database');
    });

    it('should log an error when connection encounters an error', async () => {
      (mongoose.connect as jest.Mock).mockResolvedValueOnce(mongoose);

      await connectDatabase();

      // Trigger the 'error' event
      const testError = new Error('Test connection error');
      if (listeners['error']) {
        listeners['error'](testError);
      }

      expect(logger.error).toHaveBeenCalledWith('❌ Mongoose default connection error:', testError);
    });

    it('should log a warning when connection is disconnected', async () => {
      (mongoose.connect as jest.Mock).mockResolvedValueOnce(mongoose);

      await connectDatabase();

      // Trigger the 'disconnected' event
      if (listeners['disconnected']) {
        listeners['disconnected']();
      }

      expect(logger.warn).toHaveBeenCalledWith('⚠️ Mongoose default connection disconnected');
    });

    it('should exit the process if initial connection fails', async () => {
      const connError = new Error('Connection failed');
      (mongoose.connect as jest.Mock).mockRejectedValueOnce(connError);

      await expect(connectDatabase()).rejects.toThrow('process.exit called with 1');

      expect(logger.error).toHaveBeenCalledWith('💥 Failed to connect to MongoDB on startup:', connError);
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('disconnectDatabase', () => {
    it('should disconnect from MongoDB successfully', async () => {
      (mongoose.disconnect as jest.Mock).mockResolvedValueOnce(undefined);

      await disconnectDatabase();

      expect(mongoose.disconnect).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('🔌 Mongoose default connection closed successfully.');
    });

    it('should log an error if disconnection fails', async () => {
      const discError = new Error('Disconnection failed');
      (mongoose.disconnect as jest.Mock).mockRejectedValueOnce(discError);

      await disconnectDatabase();

      expect(mongoose.disconnect).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('💥 Error closing Mongoose connection:', discError);
    });
  });
});
