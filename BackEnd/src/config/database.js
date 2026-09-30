const mongoose = require('mongoose');

async function connectDatabase(uri) {
  if (!uri) throw new Error('MONGODB_URI is missing. Add it to the .env file.');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected to MongoDB.');
}

module.exports = { connectDatabase };

