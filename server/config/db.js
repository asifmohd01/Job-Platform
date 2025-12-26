const mongoose = require("mongoose");

const connectDB = async (mongoUri) => {
  if (!mongoUri) throw new Error("MONGODB_URI is not defined");
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000, // 5 second timeout
    connectTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  console.log("MongoDB connected");
};

module.exports = connectDB;
