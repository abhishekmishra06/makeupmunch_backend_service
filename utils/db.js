//  const mongoose = require('mongoose');

// const connectDB = async () => {
//     try {
//         await mongoose.connect(process.env.URL, {
//             maxPoolSize: 50,
    //   serverSelectionTimeoutMS: 5000,
    //   socketTimeoutMS: 45000,
    //   autoIndex: false,
//         });
//         console.log('MongoDB connected');
//     } catch (err) {
//         console.error('MongoDB connection error:', err);
//         process.exit(1);
//     }
// };

// module.exports = connectDB;
const mongoose = require('mongoose');

let isConnectedBefore = false;

const connectDB = async () => {
  const mongoURL = process.env.URL;

  try {
    await mongoose.connect(mongoURL, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      autoIndex: false,
    });

    console.log('MongoDB connected');
  } catch (err) {
    console.error('Initial MongoDB connection failed:', err.message);
    setTimeout(connectDB, 5000); 
  }

  mongoose.connection.on('connected', () => {
    if (!isConnectedBefore) {
      isConnectedBefore = true;
    } else {
      console.log('🔗 MongoDB reconnected');
    }
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
    if (!isConnectedBefore) {
      console.log('⏳ Trying to reconnect...');
      setTimeout(connectDB, 5000); // reconnect on disconnect
    }
  });
};

module.exports = connectDB;
