const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('[Database Error] MONGODB_URI is missing in your .env file!');
    return null;
  }

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(`[Database] MongoDB Atlas connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    isConnected = false;
    console.error(`\n[Database Error] Could not connect to MongoDB Atlas: ${error.message}`);
    if (error.name === 'MongooseServerSelectionError') {
      console.warn(`[Atlas Whitelist Check] Your IP address may need to be whitelisted in MongoDB Atlas.`);
      console.warn(`  To fix this: Go to MongoDB Atlas (cloud.mongodb.com) -> Network Access -> Add IP Address -> 'Allow Access From Anywhere' (0.0.0.0/0) or add your current IP.\n`);
    }
    return null;
  }
};

const getDBStatus = () => ({
  isConnected: isConnected && mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host || null,
  name: mongoose.connection.name || null
});

// Support both `const connectDB = require('./config/db')` and `const { connectDB, getDBStatus } = require('./config/db')`
connectDB.connectDB = connectDB;
connectDB.getDBStatus = getDBStatus;

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.getDBStatus = getDBStatus;
