const { Booking } = require("../../models/bookingModel");
const { User, Artist } = require("../../models/userModel");
const { sendGeneralResponse } = require("../../utils/responseHelper");

const getArtistDetailsForAdmin = async (req, res) => {
  try {
    const artistId = req.params.artistId;

    // Find artist by ID
    const artist = await Artist.findById(artistId);
    if (!artist) {
      return sendGeneralResponse(res, false, "Artist not found", 404, null);
    }

    // Fetch all bookings for this artist
    const bookings = await Booking.find({ artist_id: artistId }).populate("user_id");

    // Map booking details
    const bookingDetails = bookings.map(booking => ({
      _id: booking._id,
      userName: booking.userId?.username || 'N/A',
      userEmail: booking.userId?.email || 'N/A',
      date: booking.date,
      timeSlot: booking.timeSlot,
      status: booking.status,
      totalAmount: booking.totalAmount,
      paymentMethod: booking.paymentMethod,
    }));

    const responseData = {
      _id: artist._id,
      businessName: artist.businessName,
      username: artist.username,
      email: artist.email,
      phone: artist.phone,
      city: artist.city,
      specialties: artist.specialties,
      gender: artist.gender,
      profile_img: artist.profile_img || '',
      availability: artist.availability,
      role: artist.role,
      providedByUs: artist.providedByUs,
      Status: artist.Status,
      isLogin: artist.isLogin ? 'Active' : 'Inactive',
      joinedDate: artist.createdAt,
      lastActiveAt: artist.lastActiveAt,
      bookingCount: bookings.length,
      bookings: bookingDetails,
    };

    return sendGeneralResponse(res, true, "Artist detail fetched successfully", 200, responseData);

  } catch (error) {
    console.error("Error fetching artist details for admin:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { getArtistDetailsForAdmin };
