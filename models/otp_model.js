
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    phone: { type: String, required: false, },  
    email: { type: String, required: false, },  
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
 });

const Otp = mongoose.model('Otp', otpSchema);
module.exports = Otp;