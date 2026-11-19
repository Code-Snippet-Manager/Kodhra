import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    emailVerified: Boolean,
    image: String,
  },
  {
    collection: "user",
    strict: false,
  }
);

export default userSchema;