const express = require('express');
const multer = require('multer');
const { getAccessToken, registerSalon, Salonlogin, googleAuth, firebaseAuth, sendLoginLink, loginViaLink } = require('../controller/authController');
const { verifyOtpAndChangePassword, sendPhoneOtp, verifyPhoneOtp, verifyEmailOtp, sendEmailOtp, verifyOtpAndChangeArtistPassword } = require('../controller/otpController');
const { editProfile, editArtistProfile } = require('../controller/editProfileController');
const verifyToken = require('../middleware/authMiddleware');
const { getUserPackageBookings, packageBooking, booking, getAllBookings, getUserBookings, getArtistBookings, verifyAndCompletePayment, verifyPackagePayment } = require('../controller/bookingController');
const { fetchData, getCountries, getStates, getCities } = require('../controller/stateCityController');
const { artistList, customerList, getArtistServices, addArtistServices, deleteArtistService } = require('../controller/ArtistsListController');
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
const { addFeedback } = require('../controller/feedback/addFeedback');
const { getFeedback } = require('../controller/feedback/getFeedback');
const { applyForJob, getJobApplications } = require('../controller/careers/jobApplicationController');
const { likeBlogPost } = require('../controller/blog/blogLikeController');
const { createJob, deleteJob, updateJob } = require('../controller/careers/createJob');
const { uploadArtistImages, getArtistImages } = require('../controller/subscription/gallery/gallery');
const { addOrUpdateAboutSection } = require('../controller/addAboutSectionController');
const packageController = require('../controller/packageController');
const { adminLogin } = require('../controller/adminController/adminloginController');
const { formController } = require('../controller/formController');
const { makeRating } = require('../controller/rating/MakeRating');
const { getRatings } = require('../controller/rating/getRating');
const { deleteRating } = require('../controller/rating/deleteRating');
const errorHandler = require('../middleware/errorHandler');
const sendPushNotification = require('../utils/sendReminderNotification');

const { Userlogin, login } = require('../controller/auth/login');
const { registerUsers, register } = require('../controller/auth/register');
const { addUserAddress, updateUserAddress, deleteUserAddress, getUserAddresses } = require('../controller/profileController/userAddress');


// const { Userlogin } = require('../controller/auth/login');
const { createConsultation, getAllConsultations, getConsultationById, updateConsultationStatus } = require('../controller/consultationController');

// Import artist profile routes
const artistProfileRoutes = require('./artistProfileRoutes');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/adminLogin', adminLogin);

 

// for constumer and artist login
router.post('/login', login);


router.post('/sendLoginLink', sendLoginLink);
router.post('/loginViaLink', loginViaLink);
router.post('/userlogin', Userlogin);

//  for artist and costumer login
 
router.post('/register', upload.single('profile_img'), register);

router.post('/registerSalon', upload.single('profile_img'), registerSalon);
router.post('/Salonlogin', Salonlogin);
router.post('/addOrUpdateAboutSection', addOrUpdateAboutSection);

router.get('/packages', packageController.getAllPackages);
router.post('/packages', packageController.createPackage);
router.put('/packages/:id', packageController.updatePackage);
router.delete('/packages/:id', packageController.deletePackage);

 
router.post('/getAccessToken', getAccessToken);

router.post('/sendEmailOtp', sendEmailOtp);
router.post('/sendPhoneOtp', sendPhoneOtp);

router.post('/verifyPhonOtp', verifyPhoneOtp);
router.post('/verifyEmailOtp', verifyEmailOtp);
router.post('/sendPushNotification', async (req, res) => {
  const { token, title, body, imageUrl, clickAction, channelId, actionType } = req.body;

  try {
    const result = await sendPushNotification({
      token,
      title,
      body,
      imageUrl,
      clickAction,
      channelId,
      actionType,
    });
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


router.post('/addUserAddress', addUserAddress);
router.put('/updateUserAddress', updateUserAddress);
router.delete('/deleteUserAddress', deleteUserAddress);
router.get('/getUserAddresses/:userId', getUserAddresses);




router.put('/editProfile/:id', upload.single('profile_img'), verifyToken, editProfile);
router.put('/editArtistProfile/:id', upload.single('profile_img'), verifyToken, editArtistProfile);

router.put('/change_password', verifyOtpAndChangePassword);
router.put('/changeArtistPassword', verifyOtpAndChangeArtistPassword);

 
router.post('/booking', verifyToken, booking);
router.post('/booking/verify-payment', verifyToken, verifyAndCompletePayment);
router.post('/packageBooking', packageBooking);
router.get('/getUserPackageBookings/:user_id', getUserPackageBookings)
router.get('/getbooking', getAllBookings);
router.get('/booking/user/:user_id', getUserBookings);
router.get('/booking/artist/:artist_id', getArtistBookings);
router.get('/shopsList', shopsList);
router.get('/artistsList', artistList);
router.get('/customerList', customerList);
router.get('/allUsersList', allUsersList);
router.get('/userDetail/:id', userDetail);
router.get('/user/role/:role', getUsersByRole);

router.post('/addFavorite', addFavorite);
router.post('/removeFavorite', removeFavorite);

router.post('/uploadArtistImages', upload.array('images[]'), uploadArtistImages);

router.get('/artist-images/:artistId', getArtistImages);
router.get('/artist/services/:id', getArtistServices);
router.post('/artist/addservices', addArtistServices);
router.delete('/artist/deleteService', deleteArtistService);

router.post('/makeRating', makeRating);
router.get('/getRatings', getRatings);
router.delete('/deleteRating', deleteRating);
 
// router.post('/editReview', editRe);

 

router.post('/feedback', addFeedback);
router.get('/feedback/:feedback_for_id', getFeedback);

router.post('/applyForJob', upload.single('resume'), applyForJob);
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

// Consultation routes
router.post('/consultation', createConsultation);
router.get('/consultations', getAllConsultations);
router.get('/consultation/:id', getConsultationById);
router.put('/consultation/:id/status', updateConsultationStatus);

router.get('/countries', getCountries);
router.get('/states/:countryName', getStates);
router.get('/cities/:stateName', getCities);
router.post('/verifyPayment', verifyPayment);

router.post('/form/submit', formController.createSubmission);
router.get('/form/submissions', formController.getAllSubmissions);
router.get('/form/submission/:phoneNumber', formController.getSubmissionByPhone);

router.post('/auth/firebase', firebaseAuth);

router.post('/verify-package-payment', verifyToken, verifyPackagePayment);

router.use('/artist', artistProfileRoutes);

router.use(errorHandler);

module.exports = router;

