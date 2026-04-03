const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const coonectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGOOSH_URI);
    console.log("Database connected");
  } catch (error) {
    console.log(error);
  }
};
module.exports = coonectDB;
