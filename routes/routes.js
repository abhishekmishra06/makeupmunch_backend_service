const express = require('express');
const multer = require('multer');
const { register, login, getAccessToken, registerSalon, Salonlogin,} = require('../controller/authController');
const { verifyOtpAndChangePassword, sendPhoneOtp, verifyPhoneOtp, verifyEmailOtp, sendEmailOtp } = require('../controller/otpController');
const { editProfile, editArtistProfile } = require('../controller/editProfileController');
const verifyToken = require('../middleware/authMiddleware');
const { booking, getUserBookings, getArtistBookings } = require('../controller/bookingController');
 
const { fetchData, getCountries, getStates, getCities } = require('../controller/stateCityController');
const { artistList, getArtistServices, addArtistServices, deleteArtistService } = require('../controller/ArtistsListController');
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
const { subscribe, unsubscribe } = require('../controller/subscription/subscription');
const { contactUs } = require('../controller/contactUs');
const { addFavorite } = require('../controller/addFavorite/addFavorite');
const { removeFavorite } = require('../controller/addFavorite/removeFavorite');
const { rateUser } = require('../controller/rating');
const { getRatings } = require('../controller/rating/getRating');
const { addFeedback } = require('../controller/feedback/addFeedback');
const { getFeedback } = require('../controller/feedback/getFeedback');
const { applyForJob, getJobApplications } = require('../controller/careers/jobApplicationController');
const { likeBlogPost } = require('../controller/blog/blogLikeController');
const { createJob, deleteJob, updateJob } = require('../controller/careers/createJob');
const { uploadArtistImages, getArtistImages } = require('../controller/subscription/gallery/gallery');
   const router = express.Router();
 const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', upload.single('profile_img'),  register);

router.post('/registerSalon', upload.single('profile_img'),  registerSalon);
router.post('/Salonlogin',Salonlogin);





router.post('/login',login);
router.post('/getAccessToken',getAccessToken);
 
router.post('/sendEmailOtp',sendEmailOtp);
router.post('/sendPhoneOtp',sendPhoneOtp);

router.post('/verifyPhonOtp',verifyPhoneOtp); 
router.post('/verifyEmailOtp',verifyEmailOtp);


router.put('/editProfile/:id', upload.single('profile_img'), verifyToken,  editProfile);
router.put('/editArtistProfile/:id', upload.single('profile_img'), verifyToken,   editArtistProfile);

router.put('/change_password', verifyOtpAndChangePassword);
router.post('/booking', booking);
router.get('/booking/user/:user_id', getUserBookings);
router.get('/booking/artist/:artist_id', getArtistBookings);
router.get('/shopsList', shopsList);
router.get('/artistsList', artistList);
router.get('/allUsersList', allUsersList);
router.get('/userDetail/:id', userDetail);
router.get('/user/role/:role', getUsersByRole);

router.post('/addFavorite', addFavorite);
router.post('/removeFavorite', removeFavorite);

// router.post('/uploadArtistImages',   upload.array('images'), uploadArtistImages);
router.post('/uploadArtistImages', upload.array('images[]'), uploadArtistImages);

 router.get('/artist-images/:artistId', getArtistImages);
router.get('/artist/services/:id', getArtistServices);
router.post('/artist/addservices', addArtistServices);
router.delete('/artist/deleteService', deleteArtistService);



router.post('/makeRating', rateUser);
router.get('/getRatings/:rated_id', getRatings);

router.post('/feedback', addFeedback);
router.get('/feedback/:feedback_for_id', getFeedback);

router.post('/applyForJob', upload.single('resume') , applyForJob);
router.get('/getJobApplications', getJobApplications);
router.post('/createJob', createJob);
router.put('/updateJob/:jobId', updateJob);
router.delete('/deleteJob/:jobId', deleteJob);


 

router.get('/bookingHistory/:user_id', bookingHistory);
router.post('/order', bookingpayment);
router.post('/createServiceType', createService);
router.get('/getServiceType', getServices); 

router.post('/updateServiceType/:id', updateService);


router.post('/blog/create', createBlogPost);
router.get('/blog/get', readBlogPosts);
router.put('/blog/:id', updateBlogPost);
router.delete('/blog/:id', deleteBlogPost);
router.post('/like', likeBlogPost); 


router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

router.post('/contactus', contactUs);

 
  

router.get('/countries', getCountries);
router.get('/states/:countryName', getStates);
router.get('/cities/:stateName', getCities);
router.post('/verifyPayment', verifyPayment);

 

module.exports = router; 




 