const express = require('express');
const mongoose = require('mongoose');
const { Booking, PackageBooking } = require('../models/bookingModel'); 
const Package  = require('../models/packageModel');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const { sendGeneralResponse } = require('../utils/responseHelper');
const { sendMail } = require('../utils/mailer');

const { User, Service } = require('../models/userModel');  
const moment = require('moment');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
const createRazorpayOrder = async (amount, receipt) => {
    try {
        // Ensure receipt is no longer than 40 characters
        const truncatedReceipt = receipt.substring(0, 40);
        
        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency: 'INR',
            receipt: truncatedReceipt,
            payment_capture: 1
        };
        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        throw error;
    }
};

// Verify Razorpay payment
const verifyPayment = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");
    return expectedSign === razorpay_signature;
};

const booking = async (req, res) => {
    if (!req.body) {
        return sendGeneralResponse(res, false, 'Request body is missing', 400);
    }

    const { 
        user_id, 
        user_info, 
        service_details, 
        artist_id, 
        booking_date,
        booking_time, 
        payment 
    } = req.body;

    // Basic validations
    if (!user_id || !user_info || !Array.isArray(service_details) || !artist_id || !booking_date || !booking_time) {
        return sendGeneralResponse(res, false, 'Missing required fields', 400);
    }

    // Validate service details structure
    for (const service of service_details) {
        if (!service.service_id || 
            !service.serviceName || 
            !Array.isArray(service.selected_services) || 
            service.selected_services.length === 0) {
            return sendGeneralResponse(res, false, 'Invalid service details structure', 400);
        }
    }

    try {
        // Verify user exists
        const user = await User.findById(user_id);
        console.log('Found user:', user);
        
        if (!user || (user.role !== 'customer' && user.role !== 'costumer')) {
            return sendGeneralResponse(res, false, 'User not found or invalid role', 404);
        }

        // Verify artist exists
        const artist = await User.findById(artist_id);
        console.log('Found artist:', artist);
        
        if (!artist || artist.role !== 'artist') {
            return sendGeneralResponse(res, false, 'Makeup Artist not found or invalid role', 404);
        }

        let totalAmount = 0;
        const validatedServices = [];

        // Process each service
        for (const serviceDetail of service_details) {
            // Fetch artist services from Service model
            const artistService = await Service.findOne({ 
                userId: artist_id,
                'services.serviceName': { $regex: new RegExp(serviceDetail.serviceName, 'i') }
            });

            if (!artistService) {
                console.log('Artist services not found for ID:', artist_id);
                console.log('Service name being searched:', serviceDetail.serviceName);
                return sendGeneralResponse(res, false, `No services found for this artist for ${serviceDetail.serviceName}`, 404);
            }

            // Find the main service category
            const serviceCategory = artistService.services.find(s => 
                s.serviceName.toLowerCase() === serviceDetail.serviceName.toLowerCase()
            );

            if (!serviceCategory) {
                return sendGeneralResponse(res, false, 
                    `Service category "${serviceDetail.serviceName}" not found for this artist`, 404
                );
            }

            // Validate each selected sub-service
            for (const selected of serviceDetail.selected_services) {
                const subService = serviceCategory.subServices.find(
                    sub => sub.name.toLowerCase() === selected.subService_name.toLowerCase()
                );

                if (!subService) {
                    return sendGeneralResponse(res, false, 
                        `Sub-service "${selected.subService_name}" not found in ${serviceDetail.serviceName} category`, 400
                    );
                }

                // Verify price matches
                if (subService.price !== selected.price) {
                    return sendGeneralResponse(res, false, 
                        `Price mismatch for ${selected.subService_name}. Expected: ${subService.price}, Received: ${selected.price}`, 400
                    );
                }

                totalAmount += selected.price * selected.quantity;
            }

            validatedServices.push({
                service_id: artistService._id,
                serviceName: serviceCategory.serviceName,
                selected_services: serviceDetail.selected_services,
                total_persons: serviceDetail.total_persons || 1,
                special_requirements: serviceDetail.special_requirements || ''
            });
        }

        // Validate total amount matches
        if (totalAmount !== payment.base_amount) {
            return sendGeneralResponse(res, false, 
                `Total amount mismatch. Calculated: ${totalAmount}, Received: ${payment.base_amount}`, 400
            );
        }

        // Create a shorter receipt format
        const timestamp = Date.now().toString().slice(-8); // Take last 8 digits of timestamp
        const shortUserId = user_id.toString().slice(-8); // Take last 8 digits of user ID
        const receipt = `bk_${timestamp}_${shortUserId}`; // Format: bk_TIMESTAMP_USERID
        
        // Create Razorpay order with shorter receipt
        const razorpayOrder = await createRazorpayOrder(totalAmount, receipt);

        // Create booking object with pending status
        const newBooking = new Booking({
            user_id,
            user_info,
            service_details: validatedServices,
            artist_id,
            booking_date,
            booking_time,
            status: 'pending',
            payment: {
                ...payment,
                payment_status: 'pending',
                razorpay_order_id: razorpayOrder.id,
                amount: totalAmount,
                booking_id: new mongoose.Types.ObjectId() // Generate a new ObjectId for booking_id
            }
        });

        // Save booking with pending status
        const savedBooking = await newBooking.save();

        // Return Razorpay order details to frontend
        return sendGeneralResponse(res, true, 'Razorpay order created', 201, {
            booking: savedBooking,
            razorpayOrder: {
                id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                booking_id: savedBooking._id // Send the booking ID back to frontend
            }
        });

    } catch (error) {
        console.error('Booking error:', error);
        return sendGeneralResponse(res, false, error.message || 'Internal server error', 500);
    }
};

// Add new endpoint to verify and complete payment
const verifyAndCompletePayment = async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            booking_id
        } = req.body;

        // Verify payment signature
        const isValid = verifyPayment(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return sendGeneralResponse(res, false, 'Invalid payment signature', 400);
        }

        // Update booking status
        const booking = await Booking.findById(booking_id);
        if (!booking) {
            return sendGeneralResponse(res, false, 'Booking not found', 404);
        }

        booking.payment.payment_status = 'success';
        booking.payment.razorpay_payment_id = razorpay_payment_id;
        booking.payment.razorpay_signature = razorpay_signature;
        booking.status = 'confirmed';
        
        await booking.save();

        // Send confirmation email
        try {
            await sendMail({
                to: booking.user_info.email,
                subject: 'Booking Confirmation',
                text: `Your booking has been confirmed. Booking ID: ${booking._id}`
            });
        } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
        }

        return sendGeneralResponse(res, true, 'Payment verified and booking confirmed', 200, booking);
    } catch (error) {
        console.error('Payment verification error:', error);
        return sendGeneralResponse(res, false, error.message || 'Internal server error', 500);
    }
};

const packageBooking = async (req, res) => {
    try {
        console.log('Package model:', Package);
        
        if (!req.body) {
            return sendGeneralResponse(res, false, 'Request body is missing', 400);
        }

        const { 
            user_id, 
            user_info, 
            package_details, 
            booking_date,
            booking_time, 
            payment 
        } = req.body;

        // Basic validations
        if (!user_id || !user_info || !package_details || !booking_date || !booking_time || !payment) {
            return sendGeneralResponse(res, false, 'Missing required fields', 400);
        }

        // Verify user exists
        const user = await User.findById(user_id);
        if (!user) {
            return sendGeneralResponse(res, false, 'User not found', 404);
        }

        // Verify package exists
        const package = await Package.findById(package_details.package_id);
        if (!package) {
            return sendGeneralResponse(res, false, 'Package not found', 404);
        }

        // Create booking object
        const newPackageBooking = new PackageBooking({
            user_id,
            user_info,
            package_details,
            booking_date,
            booking_time,
            payment,
            status: 'pending'
        });

        // Save the booking
        const savedBooking = await newPackageBooking.save();
        
        return sendGeneralResponse(res, true, 'Package booking created successfully', 201, savedBooking);

    } catch (error) {
        console.error('Package booking error:', error);
        return sendGeneralResponse(res, false, 'Failed to create package booking: ' + error.message, 500);
    }
};

const getUserBookings = async (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
        return sendGeneralResponse(res, false, 'User ID is required', 400);
    }

    try {
        // Verify user exists
        const user = await User.findById(user_id);
        if (!user) {
            return sendGeneralResponse(res, false, 'User not found', 404);
        }

        // Find all bookings for the user
        const bookings = await Booking.find({ user_id })
            .sort({ createdAt: -1 }) // Sort by newest first
            .populate('artist_id', 'name email phone profile_image'); // Get artist details

        return sendGeneralResponse(res, true, 'Bookings fetched successfully', 200, bookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        return sendGeneralResponse(res, false, error.message || 'Internal server error', 500);
    }
};

const getArtistBookings = async (req, res) => {
    const { artist_id } = req.params;

    if (!artist_id) {
        return sendGeneralResponse(res, false, 'Artist ID is required', 400);
    }

    try {
        // Verify artist exists and has artist role
        const artist = await User.findById(artist_id);
        if (!artist || artist.role !== 'artist') {
            return sendGeneralResponse(res, false, 'Artist not found or invalid role', 404);
        }

        // Find all bookings for the artist
        const bookings = await Booking.find({ artist_id })
            .sort({ createdAt: -1 }) // Sort by newest first
            .populate('user_id', 'name email phone profile_image'); // Get customer details

        return sendGeneralResponse(res, true, 'Bookings fetched successfully', 200, bookings);
    } catch (error) {
        console.error('Error fetching artist bookings:', error);
        return sendGeneralResponse(res, false, error.message || 'Internal server error', 500);
    }
};

const getAllBookings = async (req, res) => {
    try {
        // Get query parameters for filtering
        const { status, date_from, date_to } = req.query;
        
        // Build query object
        let query = {};
        
        // Add status filter if provided
        if (status) {
            query.status = status;
        }
        
        // Add date range filter if provided
        if (date_from || date_to) {
            query.booking_date = {};
            if (date_from) {
                query.booking_date.$gte = new Date(date_from);
            }
            if (date_to) {
                query.booking_date.$lte = new Date(date_to);
            }
        }

        // Find bookings with populated user and artist details
        const bookings = await Booking.find(query)
            .sort({ createdAt: -1 })
            .populate('user_id', 'name email phone profile_image')
            .populate('artist_id', 'name email phone profile_image');

        return sendGeneralResponse(res, true, 'Bookings fetched successfully', 200, bookings);
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        return sendGeneralResponse(res, false, error.message || 'Internal server error', 500);
    }
};

const getUserPackageBookings = async (req, res) => {
    try {
        const { user_id } = req.params;

        if (!user_id) {
            return sendGeneralResponse(res, false, 'User ID is required', 400);
        }

        // Verify user exists
        const user = await User.findById(user_id);
        if (!user) {
            return sendGeneralResponse(res, false, 'User not found', 404);
        }

        // Find all package bookings for the user
        const packageBookings = await PackageBooking.find({ user_id })
            .sort({ createdAt: -1 }) // Sort by newest first
            .populate('package_details.package_id'); // Get package details

        return sendGeneralResponse(res, true, 'Package bookings fetched successfully', 200, packageBookings);

    } catch (error) {
        console.error('Error fetching user package bookings:', error);
        return sendGeneralResponse(res, false, error.message || 'Internal server error', 500);
    }
};

module.exports = {
    booking,
    packageBooking,
    getUserBookings,
    getArtistBookings,
    getAllBookings,
    getUserPackageBookings,
    verifyAndCompletePayment
};
