const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/bookingModel'); 
const User = require('../models/userModel'); 
const { sendGeneralResponse } = require('../utils/responseHelper');
 

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
         sendGeneralResponse(res, true, 'Booking created successfully', 201, booking);
    } catch (error) {
        console.error('Booking error:', error);
        sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};

module.exports = {booking};
