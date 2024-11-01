const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/bookingModel'); 

const { sendGeneralResponse } = require('../utils/responseHelper');
const { sendMail } = require('../utils/mailer');

const { User, Service } = require('../models/userModel');  
const moment = require('moment');

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

        // Create booking object with validated data
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
                payment_status: 'pending'
            }
        });

        await newBooking.save();

        // Add debug logging
        console.log('Booking saved successfully:', newBooking);

        // ... rest of the email sending code ...

        sendGeneralResponse(res, true, 'Booking created successfully', 201, newBooking);
    } catch (error) {
        console.error('Detailed booking error:', error);
        sendGeneralResponse(res, false, error.message || 'Internal server error', 500);
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

module.exports = {
    booking,
    getUserBookings,
    getArtistBookings
};
