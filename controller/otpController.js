 
  const { sendMail } = require('../utils/mailer');
//   const dotenv = require('dotenv');
//   const connectDB = require('./utils/db');

const bcrypt = require('bcrypt');
const User = require('../models/userModel');


  const crypto = require('crypto');
const { sendSMS } = require('../utils/sms');
const { sendGeneralResponse } = require('../utils/responseHelper');

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
        await sendMail(email, 'Your OTP Code', `Your OTP code is ${otp}`,``);



        const subject = 'Your OTP Code';
    
        const html = `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
                <div style="background-color: white; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #4CAF50; padding: 10px; color: white; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1>Your OTP Code</h1>
                    </div>
                    <div style="padding: 20px;">
                        <h2 style="color: #333;">Hello!</h2>
                        <p>Your One-Time Password (OTP) is:</p>
                        <h1 style="font-size: 2em; color: #4CAF50;">${otp}</h1>
                        <p>This OTP is valid for the next 10 minutes. Please enter it on the verification page to proceed.</p>
                        <p>If you did not request this OTP, please ignore this email.</p>
                    </div>
                    <div style="margin-top: 20px; text-align: center; color: #777; font-size: 12px;">
                        <p>&copy; 2024 Our Service. All Rights Reserved.</p>
                    </div>
                </div>
            </div>
        `;




             await sendMail(email, subject, ``, html);


        res.status(200).json({ success: true, message: 'OTP sent to email' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};







 

const sendPhoneOtp = async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ success: false, message: 'phone no is required' });
    }




    try {
         const otp = crypto.randomInt(100000, 999999).toString();
        otpStore[phone] = otp; 

         // await sendMail(email, 'Your OTP Code', `Your OTP code is ${otp}`,``);
     



        const otpMessage = `Hi welcome to our service! Your OTP is: ${otp}`;  
const otpResult = await sendSMS(phone, otpMessage);


 
if (!otpResult.success) {
    console.error('OTP sending failed:', otpResult.error);
    return sendGeneralResponse(res, false, 'Failed to send OTP', 500);
}



sendGeneralResponse(res, true, 'OTP sent to phone no', 200);
        // res.status(200).json({ success: true, message: 'OTP sent to email' });
    } catch (error) {
        console.error('Error sending OTP:', error);
sendGeneralResponse(res, false, 'Internal server error', 500);

        // res.status(500).json({ success: false, message: 'Internal server error' });
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



        const subject = 'Your Password Has Been Successfully Changed';
const text = ``;

const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
        <div style="background-color: white; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #FFB6C1; padding: 10px; color: white; text-align: center; border-radius: 10px 10px 0 0;">
                <h1>Password Change Confirmation</h1>
            </div>
            <div style="padding: 20px;">
                <h2 style="color: #333;">Hello, ${user.username}!</h2>
                <p>Your password has been successfully changed. If you did not make this change, please contact our support team immediately.</p>
                <p>We recommend logging in and checking your account to ensure everything is as expected.</p>
                <p style="margin-top: 20px;">Follow us on social media:</p>
                <div style="text-align: center; margin-top: 10px;">
                    <a href="https://www.facebook.com/yourpage" style="margin-right: 10px;">
                        <img src="https://img.icons8.com/ios-filled/24/FF69B4/facebook-new.png" alt="Facebook" />
                    </a>
                    <a href="https://www.instagram.com/yourpage" style="margin-right: 10px;">
                        <img src="https://img.icons8.com/ios-filled/24/FF69B4/instagram-new.png" alt="Instagram" />
                    </a>
                    <a href="mailto:support@yourservice.com">
                        <img src="https://img.icons8.com/ios-filled/24/FF69B4/support.png" alt="Support" />
                    </a>
                </div>
            </div>
            <div style="margin-top: 20px; text-align: center; color: #777; font-size: 12px;">
                <p>&copy; 2024 Our Service. All Rights Reserved.</p>
            </div>
        </div>
    </div>
`;

         await sendMail(email, subject, text, html);
        

        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};




module.exports={
    sendOtp, sendPhoneOtp ,  verifyOtp , verifyOtpAndChangePassword
};

