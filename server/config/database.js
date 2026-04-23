import mongoose from "mongoose";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.info("MongoDB connection established successfully.");
  } catch (error) {
    console.error("MongoDB connection failed.", error);
    process.exit(1);
  }
};
