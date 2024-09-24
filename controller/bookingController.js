const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/bookingModel'); 
const User = require('../models/userModel'); 
const { sendGeneralResponse } = require('../utils/responseHelper');
const { sendMail } = require('../utils/mailer');
 
const moment = require('moment');

 const booking =  async (req, res) => {
    if (!req.body) {
        return sendGeneralResponse(res, false, 'Request body is missing', 400);
    }

    const { user_id, service_id, provider_id, booking_date, status, payment, details } = req.body;

     if (!user_id) {
        return sendGeneralResponse(res, false, 'User ID is required', 400);
    }
    if (!service_id) {
        return sendGeneralResponse(res, false, 'Service ID is required', 400);
    }
    if (!provider_id) {
        return sendGeneralResponse(res, false, 'Provider ID is required', 400);
    }
    if (!booking_date) {
        return sendGeneralResponse(res, false, 'Booking date is required', 400);
    }


    const parsedBookingDate = moment(booking_date, 'DD-MM-YYYY', true);

    // Ensure booking date is valid and not in the past
    if (!parsedBookingDate.isValid() || parsedBookingDate.isBefore(moment().startOf('day'))) {
        return sendGeneralResponse(res, false, 'Booking date must be today or a future date and in correct format (DD-MM-YYYY)', 400);
    }


    if (!status) {
        return sendGeneralResponse(res, false, 'Status is required', 400);
    }
    if (!payment) {
        return sendGeneralResponse(res, false, 'Payment status is required', 400);
    }

    if (!payment.amount) {
        return sendGeneralResponse(res, false, 'Payment amount is required', 400);
    }
    if (!payment.currency) {
        return sendGeneralResponse(res, false, 'Payment currency is required', 400);
    }
    if (!payment.payment_method) {
        return sendGeneralResponse(res, false, 'Payment method is required', 400);
    }
    if (!payment.payment_status) {
        return sendGeneralResponse(res, false, 'Payment status is required', 400);
    }


    if (!payment.transaction_id) {
        return sendGeneralResponse(res, false, 'transaction id is required', 400);
    }
    if (!payment.payment_date) {
        return sendGeneralResponse(res, false, 'Payment date is required', 400);
    }
    if (!payment.payment_id) {
        return sendGeneralResponse(res, false, 'Payment id is required', 400);
    }
    if (!payment.booking_id) {
        return sendGeneralResponse(res, false, 'booking id is required', 400);
    }


 


     try {
        const user = await User.findById(user_id);
        if (!user) {
            return sendGeneralResponse(res, false, 'User not found', 404);
        }

        // const service = await Service.findById(service_id);
        // if (!service) {
        //     return sendGeneralResponse(res, false, 'Service not found', 404);
        // }

        // Optionally validate provider if needed
        // const provider = await User.findById(provider_id); // Or appropriate model
        // if (!provider) {
        //     return sendGeneralResponse(res, false, 'Provider not found', 404);
        // }

        const provider = await User.findById(provider_id);
        if (!provider) {
            return sendGeneralResponse(res, false, 'Provider not found', 404);
        }

        // Create a new booking
        const booking = new Booking({
            user_id,
            service_id,
            provider_id,
            booking_date,
            status,
            payment,
            details
        });

        await booking.save();


        const booking_date_formatted = parsedBookingDate.format('DD MMMM YYYY');
        const payment_date_formatted = moment(payment.payment_date).format('DD MMMM YYYY');


        const subject = 'Your Booking is Confirmed!';
 
       const html = `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
                <div style="background-color: white; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #4CAF50; padding: 10px; color: white; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1>Your Booking Confirmation</h1>
                    </div>
                    <div style="padding: 20px;">
                        <h2 style="color: #333;">Hello, ${user.username}!</h2>
                        <p>Your booking is confirmed! Below are your booking details:</p>

                        <h3>Booking Details:</h3>
                        <p><strong>Service:</strong> ${service_id}</p>
                        <p><strong>Provider:</strong> ${provider.username}</p>
                        <p><strong>Booking Date:</strong> ${booking_date_formatted}</p>
                        <p><strong>Status:</strong> ${status}</p>

                        <h3>Payment Details:</h3>
                        <p><strong>Amount:</strong> ${payment.amount} ${payment.currency}</p>
                        <p><strong>Payment Method:</strong> ${payment.payment_method}</p>
                        <p><strong>Transaction ID:</strong> ${payment.transaction_id}</p>
                        <p><strong>Payment Date:</strong> ${payment_date_formatted}</p>

                        <p>We wish you all the best with your booking!</p>
                    </div>
                    <div style="margin-top: 20px; text-align: center; color: #777; font-size: 12px;">
                        <p>&copy; 2024 Our Service. All Rights Reserved.</p>
                    </div>
                </div>
            </div>
        `;

    
        await sendMail(user.email, subject, ``, html);





        const providerSubject = 'New Booking Confirmation';
        const providerHtml = `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
                <div style="background-color: white; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #4CAF50; padding: 10px; color: white; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1>New Booking Received</h1>
                    </div>
                    <div style="padding: 20px;">
                        <h2 style="color: #333;">Hello, ${provider.username}!</h2>
                        <p>You have received a new booking! Below are the details:</p>

                        <h3>Booking Details:</h3>
                        <p><strong>User:</strong> ${user.username}</p>
                        <p><strong>Service:</strong> ${service_id}</p>
                        <p><strong>Booking Date:</strong> ${booking_date_formatted}</p>
                        <p><strong>Status:</strong> ${status}</p>

                        <h3>Payment Details:</h3>
                        <p><strong>Amount:</strong> ${payment.amount} ${payment.currency}</p>
                        <p><strong>Payment Method:</strong> ${payment.payment_method}</p>
                        <p><strong>Transaction ID:</strong> ${payment.transaction_id}</p>
                        <p><strong>Payment Date:</strong> ${payment_date_formatted}</p>

                        <p>Thank you for your service!</p>
                    </div>
                    <div style="margin-top: 20px; text-align: center; color: #777; font-size: 12px;">
                        <p>&copy; 2024 Our Service. All Rights Reserved.</p>
                    </div>
                </div>
            </div>
        `;

        // Send confirmation email to the provider
        await sendMail(provider.email, providerSubject, '', providerHtml);

        

         sendGeneralResponse(res, true, 'Booking created and confirmation email sent successfully', 201, booking);
    } catch (error) {
        console.error('Booking error:', error);
        sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};

module.exports = {booking};
