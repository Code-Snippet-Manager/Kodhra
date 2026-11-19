import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "./logger.js";
export const connectMongooseDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection.db!;
    }
    await mongoose.connect(env.MONGOOSH_URI);
    logger.info("Connected to MongoDB");
    return mongoose.connection.db!;
  } catch (error) {
    logger.error({ err: error }, "Failed to connect to MongoDB");
    throw error;
  }
};
