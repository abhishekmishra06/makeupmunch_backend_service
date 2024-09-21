const { sendGeneralResponse } = require("../utils/responseHelper");
const Booking = require('../models/bookingModel'); // Assuming your Booking schema is defined

// Function to get booking history for a user
const bookingHistory = async (req, res) => {
    try {
        const { user_id } = req.params;

        console.log(`Fetching booking history for user: ${user_id}`);

        if (!user_id) {
            return sendGeneralResponse(res, false, 'User ID is required', 400);
        }
        const bookings = await Booking.find({ user_id });

        if (!bookings || bookings.length === 0) {
            return sendGeneralResponse(res, false, 'No bookings found for this user', 404);
        }

        return sendGeneralResponse(res, true, 'Booking history retrieved successfully', 200, bookings);

    } catch (error) {
        console.error('Error fetching booking history:', error);
        return sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};

module.exports = { bookingHistory };
