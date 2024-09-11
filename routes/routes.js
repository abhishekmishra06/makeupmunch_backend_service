const express = require('express');
const { register, login } = require('../controller/authController');
const { sendOtp, verifyOtp } = require('../controller/otpController');
 const router = express.Router();

//   routes
router.post('/register', register);
router.post('/login',login);
router.post('/send_otp',sendOtp);
router.post('/verify_otp',verifyOtp);

  
 

module.exports = router;
