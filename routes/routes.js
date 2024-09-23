const express = require('express');
const multer = require('multer');
const { register, login, getAccessToken,} = require('../controller/authController');
const { sendOtp, verifyOtp , verifyOtpAndChangePassword, sendPhoneOtp } = require('../controller/otpController');
const { editProfile } = require('../controller/editProfileController');
const verifyToken = require('../middleware/authMiddleware');
const { booking } = require('../controller/bookingController');
 
const { fetchData, getCountries, getStates, getCities } = require('../controller/stateCityController');
const { artistList } = require('../controller/ArtistsListController');
const { allUsersList } = require('../controller/allUsersList');
const { shopsList, getUsersByRole } = require('../controller/shopsList');
const { userDetail } = require('../controller/UserDetail');
const { bookingHistory } = require('../controller/bookingHistoryController');
const bookingpayment = require('../controller/booking_package');
const verifyPayment = require('../controller/booking_package');
const { createService, getServices, updateService } = require('../controller/serviceTypes');
const { createBlogPost } = require('../controller/blog/createBlogPost');
const { readBlogPosts } = require('../controller/blog/getBlogPost');
const { updateBlogPost } = require('../controller/blog/updateBlogPost');
const { deleteBlogPost } = require('../controller/blog/deteteBlogPost');
const { subscribe } = require('../controller/subscription/subscription');
 const router = express.Router();
 const upload = multer({ storage: multer.memoryStorage() });

//   routes
router.post('/register', upload.single('profile_img'), register);
router.post('/login',login);
router.post('/getAccessToken',getAccessToken);


 
router.post('/send_otp',sendOtp);
router.post('/send_sms',sendPhoneOtp);

router.post('/verify_otp',verifyOtp);
router.put('/editProfile/:id', upload.single('profile_img'), verifyToken,  editProfile);
router.put('/change_password', verifyOtpAndChangePassword);
router.post('/booking', booking);
router.get('/shopsList', shopsList);
router.get('/artistsList', artistList);
router.get('/allUsersList', allUsersList);
router.get('/userDetail/:id', userDetail);
router.get('/user/role/:role', getUsersByRole);
router.get('/bookingHistory/:user_id', bookingHistory);
router.post('/order', bookingpayment);
router.post('/createServiceType', createService);
router.get('/getServiceType', getServices); 
router.post('/updateServiceType/:id', updateService);


router.post('/blog/create', createBlogPost);
router.get('/blog/get', readBlogPosts);
router.put('/blog/:id', updateBlogPost);
router.delete('/blog/:id', deleteBlogPost);
router.post('/subscribe', subscribe);

 
  

router.get('/countries', getCountries);
router.get('/states/:countryName', getStates);
router.get('/cities/:stateName', getCities);
router.post('/verifyPayment', verifyPayment);

 

module.exports = router; 




 