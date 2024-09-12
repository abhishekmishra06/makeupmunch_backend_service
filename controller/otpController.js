 
  const { sendMail } = require('../utils/mailer');
//   const dotenv = require('dotenv');
//   const connectDB = require('./utils/db');
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





module.exports={
    sendOtp, verifyOtp
};

// const login = async (req, res) => {
//     const { email, password } = req.body;

//     if (!email) {
//         return sendGeneralResponse(res, false, "Email field is required", 400);
//     }

//     if (!password) {
//         return sendGeneralResponse(res, false, "Password field is required", 400);
//     }

//     try {
//         const user = await User.findOne({ email });

//         if (!user) {
//             return sendGeneralResponse(res, false, 'User not registered', 400);
//         }

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (isMatch) {
//             const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
//             user.token = token;
//             await user.save();
//             return sendGeneralResponse(res, true, 'Login successful', 200, { ...user._doc, token });
//         } else {
//             return sendGeneralResponse(res, false, 'Invalid password', 400);
//         }
//     } catch (error) {
//         console.error('Login error:', error);
//         return sendGeneralResponse(res, false, "Internal server error", 500);
//     }
// };