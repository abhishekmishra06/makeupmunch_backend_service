const { Booking } = require("../../models/bookingModel");
const { User } = require("../../models/userModel");
const { sendGeneralResponse } = require("../../utils/responseHelper");
const Address = require('../../models/userAddressModel');


const getAllUsersForAdmin = async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' });

    const fullUserInfo = await Promise.all(users.map(async (user) => {
      const address = await Address.findOne({ userId: user._id });
      const bookingCount = await Booking.countDocuments({ userId: user._id });





      return {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        gender: user.gender || '',
        profile_img: user.profile_img || '',
        isLogin: user.isLogin ? 'Active' : 'Inactive',
        joinedDate: user.createdAt,
        lastActiveAt: user.lastActiveAt,
        city: address?.addresses?.[0]?.city || 'N/A',
        bookingCount
      };
    }));


    return sendGeneralResponse(res, false, "Get Users List Successfull", 400, fullUserInfo);


  } catch (error) {
    console.error('Error fetching users for admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};



module.exports = { getAllUsersForAdmin }