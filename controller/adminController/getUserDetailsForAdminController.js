const { Booking } = require("../../models/bookingModel");
const { User, Customer } = require("../../models/userModel");
const Address = require('../../models/userAddressModel');
const { sendGeneralResponse } = require("../../utils/responseHelper");

const getUserDetailsForAdmin = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user
    const user = await Customer.findById(userId);
    if (!user) {
      return sendGeneralResponse(res, false, "User not found", 404, null);
    }

    // Fetch all addresses
    const addressDoc = await Address.findOne({ userId });
    const addresses = addressDoc?.addresses || [];

    // Fetch all bookings for user
    const bookings = await Booking.find({ userId }).populate('artist_id');

    // Prepare booking data with optional artist details
    const bookingDetails = bookings.map(booking => ({
      _id: booking._id,
      artistName: booking.artistId?.businessName || 'N/A',
      artistEmail: booking.artistId?.email || 'N/A',
      date: booking.date,
      timeSlot: booking.timeSlot,
      status: booking.status,
      totalAmount: booking.totalAmount,
      paymentMethod: booking.paymentMethod,
    }));

    const responseData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      gender: user.gender || '',
      role: user.role,
      profile_img: user.profile_img || '',
      isLogin: user.isLogin ? 'Active' : 'Inactive',
      joinedDate: user.createdAt,
      lastActiveAt: user.lastActiveAt,
      bookingCount: bookings.length,
      addresses,
      bookings: bookingDetails
    };

    return sendGeneralResponse(res, true, "User detail fetched successfully", 200, responseData);

  } catch (error) {
    console.error("Error fetching user details for admin:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = { getUserDetailsForAdmin };
