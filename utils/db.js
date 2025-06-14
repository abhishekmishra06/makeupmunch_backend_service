 const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.URL, {
             useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // 🔐 controls how many concurrent connections are maintained
      serverSelectionTimeoutMS: 5000,
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
