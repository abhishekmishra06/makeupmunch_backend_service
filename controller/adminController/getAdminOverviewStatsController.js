const moment = require('moment');
const User = require('../../models/userModel'); // adjust path as needed
const { Booking, PackageBooking } = require('../../models/bookingModel'); // adjust path as needed
const { sendGeneralResponse } = require('../../utils/responseHelper');

const getAdminOverviewStats = async (req, res) => {
  try {
    const now = moment();
    const startOfCurrentMonth = now.clone().startOf('month').toDate();
    const startOfLastMonth = now.clone().subtract(1, 'month').startOf('month').toDate();
    const endOfLastMonth = now.clone().subtract(1, 'month').endOf('month').toDate();
    const startOfTwoMonthsAgo = now.clone().subtract(2, 'month').startOf('month').toDate();
    const endOfTwoMonthsAgo = now.clone().subtract(2, 'month').endOf('month').toDate();

    //  USERS
    // const totalUsers = await User.countDocuments();
    const totalCustomers = await User.Customer.countDocuments({ role: 'customer' });
    const totalArtists = await User.Artist.countDocuments({ role: 'artist' });

    const customersLastMonth = await User.Customer.countDocuments({
      role: 'customer',
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    const artistsLastMonth = await User.Artist.countDocuments({
      role: 'artist',
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    // SERVICE BOOKINGS
    const totalServiceBookings = await Booking.countDocuments();

    const serviceBookingsLastMonth = await Booking.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    const serviceBookingsTwoMonthsAgo = await Booking.countDocuments({
      createdAt: { $gte: startOfTwoMonthsAgo, $lte: endOfTwoMonthsAgo }
    });

    // PACKAGE BOOKINGS
    const totalPackageBookings = await PackageBooking.countDocuments();

    const packageBookingsLastMonth = await PackageBooking.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    const packageBookingsTwoMonthsAgo = await PackageBooking.countDocuments({
      createdAt: { $gte: startOfTwoMonthsAgo, $lte: endOfTwoMonthsAgo }
    });

    //  FINAL STATS
    const stats = {
      users: {
        // totalUsers,
        totalCustomers,
        totalArtists,
        customersLastMonth,
        artistsLastMonth,
      },
      serviceBookings: {
        totalServiceBookings,
        serviceBookingsLastMonth,
        serviceBookingsTwoMonthsAgo,
      },
      packageBookings: {
        totalPackageBookings,
        packageBookingsLastMonth,
        packageBookingsTwoMonthsAgo,
      },
    };

    return sendGeneralResponse(res, true, "Admin stats fetched successfully", 200, stats);
  } catch (error) {
    console.error("Error in getAdminOverviewStats:", error);
    return sendGeneralResponse(res, false, "Internal Server Error", 500);
  }
};

module.exports = { getAdminOverviewStats };
