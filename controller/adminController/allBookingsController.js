// controllers/adminBookingController.js

const { Booking } = require('../../models/bookingModel');
const User = require('../../models/userModel'); // Assuming user profile pic is in User model

const getAllBookingsForAdmin = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user_id', 'email profile_img')   // fetch customer email and profile
            .populate('artist_id', 'username  profile_img') // fetch artist name
            .lean(); // lean for faster read

        const formatted = bookings.map(booking => {
            const customerName = `${booking.user_info.user_Fname} ${booking.user_info.user_Lname}`;
            const artistName = booking.artist_id
                ? `${booking.artist_id.username}`
                : 'N/A';

            const services = booking.service_details.map(service => ({
                serviceName: service.serviceName,
                subServices: service.selected_services.map(sub => ({
                    name: sub.subService_name,
                    price: sub.price,
                    quantity: sub.quantity
                }))
            }));

            return {
                bookingId: booking.payment.booking_id,
                customerName,
                customerEmail: booking.user_id?.email || 'N/A',
                customerImage: booking.user_id?.profile_img || '',
                services,
                artistName,
                date: booking.booking_date,
                time: booking.booking_time,
                status: booking.status,
                amount: booking.payment.total_amount
            };
        });

        res.status(200).json(formatted);
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



module.exports = { getAllBookingsForAdmin }