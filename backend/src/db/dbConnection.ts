import mongoose from "mongoose";
import dotenv from "dotenv";
import {DbConnectionError} from "../errors/dbConnection.error";

dotenv.config();

export async function connectDB () {
  const mongoUrl = process.env.MONGO_URL || '';

  try {
    const dbConnection = await mongoose.connect(mongoUrl);

    console.log(`DB connected: ${dbConnection.connection.host}`)
  } catch {
    throw new DbConnectionError('Failed to connect to the DB')
  }
}
