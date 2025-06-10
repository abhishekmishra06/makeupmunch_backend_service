const { About, Experience, Certification, Product } = require("../../models/artistProfileModel");
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
      userName: booking.user_id?.username || 'N/A',
      userEmail: booking.user_id?.email || 'N/A',
      bookingDate: booking.booking_date,
      bookingTime: booking.booking_time,
      status: booking.status,
      totalAmount: booking.payment.total_amount,
      paymentMethod: booking.payment.payment_method,
    }));


    const about = await About.findOne({ artistId });
    const experience = await Experience.find({ artistId }).sort({ year: -1 });
    const certifications = await Certification.find({ artistId }).sort({ issueDate: -1 });
    const products = await Product.find({ artistId });



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
      about: about?.description || '',
      experience,
      certifications,
      products,
    };

    return sendGeneralResponse(res, true, "Artist detail fetchedwewe successfully", 200, responseData);

  } catch (error) {
    console.error("Error fetching artist details for admin:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { getArtistDetailsForAdmin };
