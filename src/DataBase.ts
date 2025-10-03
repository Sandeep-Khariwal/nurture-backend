import mongoose from "mongoose";

export const DataBase = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.DATABASE as string).then(() => {
      console.log("database connected successfully");
    });
  } catch (error) {
    console.log("error while connecting to the database", error);
  }
};