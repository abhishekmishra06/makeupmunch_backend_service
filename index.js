const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./utils/db');
const crypto = require('crypto');
// const { sendMail } = require('./mailer');
// const User = require('./models/User'); 
  
const authRoutes = require('./routes/routes');
const { sendMail } = require('./utils/mailer');
 
// connect to database
dotenv.config();
connectDB();

const app = express();
app.use(express.json());

 // Routes
app.get('', (req, res) => {
    res.send('Welcome to Makeup Munch');
});
   
app.use('', authRoutes);

app.use('/auth', authRoutes);
 
const otpStore = {};


app.post('/send-otp', async (req, res) => {
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
});

// Verify OTP
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const storedOtp = otpStore[email];

    if (storedOtp && storedOtp === otp) {
        delete otpStore[email]; // OTP valid, remove it from store
        res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});