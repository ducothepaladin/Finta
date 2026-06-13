import mongoose from "mongoose"
import { env } from "../config/env.js"

export async function connectDb(): Promise<void> {
  try {
    await mongoose.connect(env.mongodbUri)
    console.log("Connected to MongoDB")
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw error
  }
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect()
  console.log("Disconnected from MongoDB")
}
