const express = require('express');
const router = express.Router();
const { 
  updateAddressAfterBooking, 
  getBookingAddress, 
  getUserSavedAddresses, 
  setDefaultAddress,
  updateBookingAddress
} = require('../controller/addressUpdateController');

// Route to save address after booking
router.post('/saveBookingAddress', updateAddressAfterBooking);

// Route to get booking address
router.get('/getBookingAddress/:bookingId', getBookingAddress);

// Route to get user saved addresses
router.get('/getUserAddresses/:userId', getUserSavedAddresses);

// Route to set default address
router.post('/setDefaultAddress', setDefaultAddress);

// Route to update booking address
router.put('/updateBookingAddress', updateBookingAddress);

module.exports = router; 