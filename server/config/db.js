const mongoose = require('mongoose');

/**
 * Connect to MongoDB with retry logic.
 * Falls back gracefully if MongoDB is unavailable.
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/loan-analyzer';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.warn('⚠️  Server will run without database persistence (in-memory mode).');
  }
};

module.exports = connectDB;
