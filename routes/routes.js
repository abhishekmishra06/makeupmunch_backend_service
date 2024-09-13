const express = require('express');
const multer = require('multer');
const { register, login,} = require('../controller/authController');
const { sendOtp, verifyOtp , verifyOtpAndChangePassword } = require('../controller/otpController');
const { editProfile } = require('../controller/editProfile');
const verifyToken = require('../middleware/authMiddleware');
 const router = express.Router();
 const upload = multer({ storage: multer.memoryStorage() });

//   routes
// router.post('/register', register);
router.post('/register', upload.single('profile_img'), register);

router.post('/login',login);
router.post('/send_otp',sendOtp);
router.post('/verify_otp',verifyOtp);
router.put('/editProfile/:id', upload.single('profile_img'), verifyToken,  editProfile);


router.put('/change_password', verifyOtpAndChangePassword);
  
 

module.exports = router; 




 