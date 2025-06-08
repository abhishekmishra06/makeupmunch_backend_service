const express = require('express');
const router = express.Router();
const {
  sendEmailVerification,
  verifyEmailOtp,
  resendEmailVerification,
  checkEmailVerificationStatus
} = require('../controller/emailVerificationController');

// Route to send email verification OTP
router.post('/send', sendEmailVerification);

// Route to verify email OTP
router.post('/verify', verifyEmailOtp);

// Route to resend email verification OTP
router.post('/resend', resendEmailVerification);

// Route to check email verification status
router.get('/status', checkEmailVerificationStatus);

module.exports = router; 