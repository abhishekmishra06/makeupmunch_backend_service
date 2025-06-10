const { Booking } = require("../../../models/bookingModel");

const getBookingDetailsById = async (req, res) => {
  const { bookingId } = req.params;

  if (!bookingId) {
    return res.status(400).json({ status: false, message: "Booking ID is required" });
  }

  try {
    const booking = await Booking.findById(bookingId)
      .populate("user_id", "-password -refreshToken -addresses")
      .populate("artist_id", "username businessName email phone")
      .populate("service_details.service_id", "name category")
      .lean();

    if (!booking) {
      return res.status(404).json({ status: false, message: "Booking not found" });
    }

    return res.status(200).json({
      status: true,
      message: "Booking details fetched successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

module.exports = { getBookingDetailsById };
