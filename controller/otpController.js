 
  const { sendMail } = require('../utils/mailer');
//   const dotenv = require('dotenv');
//   const connectDB = require('./utils/db');

const bcrypt = require('bcrypt');
const User = require('../models/userModel');


  const crypto = require('crypto');
const otpStore = {};

const sendOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    try {
        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        otpStore[email] = otp; // Store OTP temporarily

        // Send OTP via email
        await sendMail(email, 'Your OTP Code', `Your OTP code is ${otp}`);
     

        res.status(200).json({ success: true, message: 'OTP sent to email' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Verify OTP
const verifyOtp = (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const storedOtp = otpStore[email];

    if (storedOtp && storedOtp === otp) {
        delete otpStore[email];
        res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
};


const verifyOtpAndChangePassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }

    const storedOtp = otpStore[email];

    if (!storedOtp || storedOtp !== otp) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    try { 
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Hash new password and update
        user.password = await bcrypt.hash(newPassword, 10);

        // Save only the updated password without affecting other fields
        await User.updateOne({ email }, { $set: { password: user.password } });

        // Remove OTP from store
        delete otpStore[email];

        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};




module.exports={
    sendOtp, verifyOtp , verifyOtpAndChangePassword
};

