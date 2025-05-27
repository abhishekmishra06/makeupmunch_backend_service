 const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.URL);
        console.log('MongoDB connected new changes');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
