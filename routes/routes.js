const express = require('express');
const multer = require('multer');
const { register, login } = require('../controller/authController');
const { sendOtp, verifyOtp } = require('../controller/otpController');
 const router = express.Router();
 const upload = multer({ storage: multer.memoryStorage() });

//   routes
// router.post('/register', register);
router.post('/register', upload.single('profile_img'), register);

router.post('/login',login);
router.post('/send_otp',sendOtp);
router.post('/verify_otp',verifyOtp);

  
 

module.exports = router;
