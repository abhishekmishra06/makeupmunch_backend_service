const express = require('express');
const mongoose = require('mongoose');
const { Booking, PackageBooking } = require('../models/bookingModel');
const Package = require('../models/packageModel');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const { sendGeneralResponse } = require('../utils/responseHelper');
const { sendMail } = require('../utils/mailer');

const { User, Service, Artist, Customer } = require('../models/userModel');
const moment = require('moment');

// Initialize Razorpay with your credentials
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
const createRazorpayOrder = async (amountInRupees, receipt) => {

    try {

        const amountInPaise = Math.round(amountInRupees * 100);



        // Ensure receipt is no longer than 40 characters
        const truncatedReceipt = receipt.substring(0, 40);

        const options = {
            amount: amountInPaise, // Fixed amount: 1 rupee = 100 paise
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
        const user = await Customer.findById(user_id);
        console.log('Found user:', user);

        if (!user || (user.role !== 'customer' && user.role !== 'costumer')) {
            return sendGeneralResponse(res, false, 'User not found or invalid role', 404);
        }

        // Verify artist exists
        const artist = await Artist.findById(artist_id);
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
            user_info: {
                ...user_info,
                email: user_info.email || user.email, // Fallback to user's email if not in user_info
            },
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
                booking_id: new mongoose.Types.ObjectId()
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

        // Log the received data
        console.log('Payment verification request received:', {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            booking_id
        });

        // Validate required fields
        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !booking_id) {
            return sendGeneralResponse(res, false, 'Missing required payment verification fields', 400);
        }

        // Try to find regular booking first
        let booking = await Booking.findById(booking_id);
        let isPackageBooking = false;

        // If not found, try to find package booking
        if (!booking) {
            booking = await PackageBooking.findById(booking_id);
            isPackageBooking = true;
        }

        if (!booking) {
            return sendGeneralResponse(res, false, 'Booking not found', 404);
        }

        // Verify payment signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (expectedSign !== razorpay_signature) {
            return sendGeneralResponse(res, false, 'Invalid payment signature', 400);
        }

        try {
            // Update booking status based on booking type
            if (isPackageBooking) {
                booking.status = 'confirmed';
                booking.payment.payment_status = 'paid';
                booking.payment.razorpay_payment_id = razorpay_payment_id;
                booking.payment.razorpay_signature = razorpay_signature;
            } else {
                booking.status = 'confirmed';
                booking.payment.payment_status = 'paid';
                booking.payment.razorpay_payment_id = razorpay_payment_id;
                booking.payment.razorpay_signature = razorpay_signature;
            }

            await booking.save();

            // Send confirmation emails in user's email
            try {
                const userEmail = booking.user_info.email || (await Customer.findById(booking.user_id))?.email;




                if (userEmail) {
                    const subject = 'Booking Confirmation - Makeup Munch';


                    const text = `Dear ${booking.user_info.user_Fname},

Your booking has been confirmed!

Booking Details:
- Booking ID: ${booking._id}
- Date: ${new Date(booking.booking_date).toLocaleDateString()}
- Time: ${booking.booking_time}
${isPackageBooking ? `- Package: ${booking.package_details.package_name}` : ''}

Thank you for choosing Makeup Munch!`;



                    const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="background-color: #fff; max-width: 600px; margin: auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden;">
      <div style="background-color: #FFB6C1; padding: 20px; color: white; text-align: center;">
        <h1 style="margin: 0;">Booking Confirmed!</h1>
      </div>
      <div style="padding: 20px; color: #333;">
        <h2>Hi ${booking.user_info.user_Fname},</h2>
        <p>Thank you for choosing <strong>Makeup Munch</strong>. Your booking is successfully confirmed. Here are the details:</p>
        <ul style="line-height: 1.6;">
          <li><strong>Booking ID:</strong> ${booking._id}</li>
          <li><strong>Date:</strong> ${new Date(booking.booking_date).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${booking.booking_time}</li>
          ${isPackageBooking ? `<li><strong>Package:</strong> ${booking.package_details.package_name}</li>` : ''}
        </ul>
        <p>You can view or manage your booking anytime by visiting your dashboard.</p>
        <a href="https://www.makeupmunch.in/userdashboard" style="display: inline-block; background-color: #FF69B4; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Go to Dashboard</a>
        <hr style="margin: 30px 0;">
        <p style="margin: 0;">Need help? Contact us at <a href="mailto:techmakeupmunch@gmail.com">techmakeupmunch@gmail.com</a></p>
        <div style="margin-top: 20px; text-align: center;">
          <a href="https://www.facebook.com/yourpage" style="margin: 0 10px;">
            <img src="https://img.icons8.com/ios-filled/24/FF69B4/facebook-new.png" alt="Facebook" />
          </a>
          <a href="https://www.instagram.com/yourpage" style="margin: 0 10px;">
            <img src="https://img.icons8.com/ios-filled/24/FF69B4/instagram-new.png" alt="Instagram" />
          </a>
          <a href="mailto:techmakeupmunch@gmail.com" style="margin: 0 10px;">
            <img src="https://img.icons8.com/ios-filled/24/FF69B4/support.png" alt="Support" />
          </a>
        </div>
      </div>
    </div>
  </div>
`;



                    await sendMail({
                        to: userEmail.trim(),
                        subject: subject,
                        text: text,
                        html: html

                        //                         `Dear ${booking.user_info.user_Fname},

                        // Your booking has been confirmed!

                        // Booking Details:
                        // - Booking ID: ${booking._id}
                        // - Date: ${new Date(booking.booking_date).toLocaleDateString()}
                        // - Time: ${booking.booking_time}
                        // ${isPackageBooking ? `- Package: ${booking.package_details.package_name}` : ''}

                        // Thank you for choosing Makeup Munch!`
                    });
                }

                // Only send artist notification for regular bookings
                if (!isPackageBooking && booking.artist_id) {
                    const artist = await Artist.findById(booking.artist_id);
                    console.log(` this is artist ${artist}`);
                    if (artist?.email) {


                        const subject = '🎉 You Have a New Booking on Makeup Munch!';
                        const text = `Hi ${artist.username || 'Artist'},

Great news! You have received a new confirmed booking.

📋 Booking Details:
- Booking ID: ${booking._id}
- Customer Name: ${booking.user_info.user_Fname} ${booking.user_info.user_Lname}
- Date: ${new Date(booking.booking_date).toLocaleDateString()}
- Time: ${booking.booking_time}

🧾 Please log in to your artist dashboard to view all the details and get ready to delight your client!

Login here: https://www.makeupmunch.in/artistbooking

Best regards,
Team Makeup Munch`;

                        const html = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fff0f5; padding: 30px;">
    <div style="background-color: white; max-width: 600px; margin: auto; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.1); overflow: hidden;">
      <div style="background-color: #FF69B4; padding: 20px; color: white; text-align: center;">
        <h2 style="margin: 0;">🎉 You Have a New Booking!</h2>
      </div>
      <div style="padding: 25px 20px;">
        <p style="font-size: 16px;">Hi <strong>${artist.username || 'Artist'}</strong>,</p>
        <p style="font-size: 16px;">You've just received a <strong>new confirmed booking</strong> on <strong>Makeup Munch</strong>!</p>
        <div style="background-color: #f9f9f9; border: 1px dashed #ddd; padding: 15px; margin: 20px 0; border-radius: 8px;">
          <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${booking._id}</p>
          <p style="margin: 5px 0;"><strong>Customer:</strong> ${booking.user_info.user_Fname} ${booking.user_info.user_Lname}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(booking.booking_date).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${booking.booking_time}</p>
        </div>
        <p>Visit your dashboard to view the full details and prepare accordingly.</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="https://www.makeupmunch.in/artistbooking" style="background-color: #FF69B4; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px;">Go to Artist Dashboard</a>
        </div>
        <p style="font-size: 14px; color: #555;">Need help? Contact us at <a href="mailto:techmakeupmunch@gmail.com">techmakeupmunch@gmail.com</a></p>
        <hr style="margin: 30px 0;">
        <div style="text-align: center;">
          <a href="https://www.facebook.com/yourpage" style="margin: 0 10px;">
            <img src="https://img.icons8.com/ios-filled/24/FF69B4/facebook-new.png" alt="Facebook">
          </a>
          <a href="https://www.instagram.com/yourpage" style="margin: 0 10px;">
            <img src="https://img.icons8.com/ios-filled/24/FF69B4/instagram-new.png" alt="Instagram">
          </a>
        </div>
      </div>
    </div>
  </div>
`;


                        await sendMail({
                            to: artist.email.trim(),
                            subject: subject,
                            text: text,
                            html: html
                        });
                    }
                } else if (isPackageBooking) {
                    // Send to fixed email for package booking
                    const subject = '🎉 New Package Booking Received on Makeup Munch!';


                    const html = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #e0f7f5; padding: 30px;">
    <div style="background-color: white; max-width: 600px; margin: auto; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.1); overflow: hidden;">
      <div style="background-color: #20c997; padding: 20px; color: white; text-align: center;">
        <h2 style="margin: 0;">📦✨ New Package Booking!</h2>
      </div>
      <div style="padding: 25px 20px;">
        <p style="font-size: 16px;">Hi <strong>Team</strong>,</p>
        <p style="font-size: 16px;">You have received a <strong>new package booking</strong> on <strong>Makeup Munch</strong>.</p>
        <div style="background-color: #f1fcfb; border: 1px dashed #a0ddd9; padding: 15px; margin: 20px 0; border-radius: 8px;">
          <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${booking._id}</p>
          <p style="margin: 5px 0;"><strong>Customer:</strong> ${booking.user_info.user_Fname} ${booking.user_info.user_Lname}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(booking.booking_date).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${booking.booking_time}</p>
        </div>
        <p>Please check the admin panel for full details.</p>
        <p style="font-size: 14px; color: #555;">Need help? Contact us at <a href="mailto:techmakeupmunch@gmail.com">techmakeupmunch@gmail.com</a></p>
        <hr style="margin: 30px 0;">
        <div style="text-align: center;">
          <a href="https://www.facebook.com/yourpage" style="margin: 0 10px;">
            <img src="https://img.icons8.com/ios-filled/24/20c997/facebook-new.png" alt="Facebook">
          </a>
          <a href="https://www.instagram.com/yourpage" style="margin: 0 10px;">
            <img src="https://img.icons8.com/ios-filled/24/20c997/instagram-new.png" alt="Instagram">
          </a>
        </div>
      </div>
    </div>
  </div>
`;

                    await sendMail({
                        to: 'techmakeupmunch@gmail.com',
                        subject,
                        text: '',
                        html
                    });
                }

            } catch (emailError) {
                console.error('Error sending confirmation emails:', emailError);
                // Continue with success response since payment was successful
            }

            return sendGeneralResponse(res, true, 'Payment verified and booking confirmed', 200, {
                booking,
                payment_id: razorpay_payment_id
            });

        } catch (error) {
            console.error('Payment verification error:', error);
            return sendGeneralResponse(res, false,
                `Payment verification failed: ${error.message}. Please contact support with payment ID: ${razorpay_payment_id}`,
                400
            );
        }

    } catch (error) {
        console.error('Payment verification error:', error);
        return sendGeneralResponse(res, false,
            `Payment verification failed. Please contact support with payment ID: ${req.body?.razorpay_payment_id}`,
            500
        );
    }
};

const packageBooking = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: 'Request body is missing'
            });
        }


        const {
            user_id,
            user_info,
            package_details,
            booking_date,
            booking_time,
            payment
        } = req.body;


        console.log('user_id:', user_id);
        console.log('user_info:', user_info);
        console.log('package_details:', package_details);
        console.log('booking_date:', booking_date);
        console.log('booking_time:', booking_time);
        console.log('payment:', payment);


        // multiple package booking
        if (
            !user_id ||
            !user_info ||
            !package_details ||
            !Array.isArray(package_details.packages) ||
            package_details.packages.length === 0 ||
            !booking_date ||
            !booking_time ||
            !payment
        ) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }


        const calculatePlatformCharge = (totalAmount) => {
            if (totalAmount < 500) {
                return 70;
            } else if (totalAmount >= 500 && totalAmount <= 1000) {
                return 40;
            } else {
                return 0;
            }
        };

        const calculateVenueCharge = (totalAmount) => {
            if (totalAmount < 500) {
                return 30;
            } else if (totalAmount >= 500 && totalAmount <= 1000) {
                return 30;
            } else {
                return 0;
            }
        };

        // Verify user exists
        const user = await Customer.findById(user_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let totalAmount = 0;
        let packageBasePrice = 0;
        let updatedPackageDetails = [];



        // Verify package exists and get its price
        // const packageData = await Package.findById(package_details.package_id);


        // validate all package 
        for (const pkg of package_details.packages) {
            try {
                const packageData = await Package.findById(pkg.package_id);
                if (!packageData) {
                    return res.status(404).json({
                        success: false,
                        message: `Package not found: ${pkg.package_id}`
                    });
                }

                const basePrice = parseInt(packageData.price.replace(/,/g, '')) || 0;
                packageBasePrice += basePrice;

                const totalPersons = parseInt(pkg.total_persons) || 1;
                const subtotal = basePrice * totalPersons;
                totalAmount += subtotal;





                updatedPackageDetails.push({
                    ...pkg,
                    package_name: packageData.name,
                    package_price: basePrice,
                    subtotal: subtotal
                });
            } catch (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching package data',
                    error: err.message
                });
            }
        }


        const platformCharge = calculatePlatformCharge(totalAmount);
        const venueCharge = calculateVenueCharge(totalAmount);
        const grandTotalAmount = totalAmount + platformCharge + venueCharge;
        const amountInPaise = grandTotalAmount * 100;

        // const amountInPaise = totalAmount * 100;




        // console.log(`this is package data ${packageData}`)
        // console.log(`this is package_details.package_id ${package_details.package_id}`)
        // console.log(`this is package_details ${package_details}`)


        // if (!packageData) {
        //     return res.status(404).json({
        //         success: false,
        //         message: 'Package not found'
        //     });
        // }


        try {
            // Calculate total amount in paise (Razorpay expects amount in smallest currency unit)
            // const basePrice = parseInt(packageData.price.replace(/,/g, ''));
            // const totalAmount = basePrice * (parseInt(package_details.total_persons) || 1);
            // const amountInPaise = totalAmount * 100;

            // console.log('Calculated amounts:', {
            //     basePrice,
            //     totalAmount,
            //     amountInPaise
            // });

            // Create a shorter receipt format
            const timestamp = Date.now().toString().slice(-8);
            const shortUserId = user_id.toString().slice(-8);
            const receipt = `pkg_${timestamp}_${shortUserId}`;
            const bookingId = `BK${timestamp}${shortUserId}`;

            // Create Razorpay order
            console.log('Creating Razorpay order with amount:', amountInPaise);
            const razorpayOrder = await razorpay.orders.create({
                amount: amountInPaise,
                currency: 'INR',
                receipt: receipt,
                payment_capture: 1
            });

            console.log('Razorpay order created:', razorpayOrder);

            // Create booking object
            const newPackageBooking = new PackageBooking({
                user_id,
                user_info,
                package_details: updatedPackageDetails,
                booking_date,
                booking_time,
                status: 'pending',
                payment: {
                    package_price: packageBasePrice,
                    total_amount: totalAmount,
                    amount: amountInPaise,
                    payment_method: 'online',
                    payment_status: 'pending',
                    booking_id: bookingId,
                    razorpay_order_id: razorpayOrder.id
                }
            });

            // Save the booking
            const savedBooking = await newPackageBooking.save();
            console.log('Booking saved:', savedBooking);

            return res.status(201).json({
                success: true,
                message: 'Package booking created successfully',
                data: {
                    booking: savedBooking,
                    razorpayOrder: {
                        id: razorpayOrder.id,
                        amount: amountInPaise,
                        currency: 'INR'
                    }
                }
            });

        } catch (error) {
            console.error('Error in package booking inner try block:', error);
            return res.status(500).json({
                success: false,
                message: 'Error creating package booking',
                error: error.message
            });
        }

    } catch (error) {
        console.error('Error in package booking outer try block:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};



const getUserBookings = async (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
        return sendGeneralResponse(res, false, 'User ID is required', 400);
    }

    try {
        // Verify user exists
        const user = await Customer.findById(user_id);
        if (!user) {
            return sendGeneralResponse(res, false, 'User not found', 404);
        }

        // Find all bookings for the user
        const bookings = await Booking.find({ user_id })
            .sort({ createdAt: -1 }) // Sort by newest first
            .populate('artist_id', 'username name email phone profile_img'); // Get artist details with correct field names

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
        const artist = await Artist.findById(artist_id);
        if (!artist || artist.role !== 'artist') {
            return sendGeneralResponse(res, false, 'Artist not found or invalid role', 404);
        }

        // Find all bookings for the artist
        const bookings = await Booking.find({ artist_id })
            .sort({ createdAt: -1 }) // Sort by newest first
            .populate('user_id', 'username email phone profile_img'); // Get customer details

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
            .populate('user_id', 'username email phone profile_img')
            .populate('artist_id', 'username email phone profile_img');

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
        const user = await Customer.findById(user_id);
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

const verifyPackagePayment = async (req, res) => {
    try {
        console.log('Headers received:', req.headers);
        console.log('Body received:', req.body);

        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            booking_id
        } = req.body;

        console.log('Package Payment verification request:', {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            booking_id
        });

        // Validate required fields
        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !booking_id) {
            console.error('Missing required fields:', {
                razorpay_payment_id: !!razorpay_payment_id,
                razorpay_order_id: !!razorpay_order_id,
                razorpay_signature: !!razorpay_signature,
                booking_id: !!booking_id
            });
            return res.status(400).json({
                success: false,
                message: 'Missing required payment verification fields'
            });
        }

        // Find the package booking
        console.log('Looking for booking with ID:', booking_id);
        const booking = await PackageBooking.findById(booking_id);

        if (!booking) {
            console.error('Booking not found for ID:', booking_id);
            return res.status(404).json({
                success: false,
                message: 'Package booking not found'
            });
        }

        console.log('Found booking:', booking);

        try {
            // Verify payment signature
            const sign = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSign = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(sign.toString())
                .digest("hex");

            console.log('Signature verification:', {
                expected: expectedSign,
                received: razorpay_signature,
                isValid: expectedSign === razorpay_signature
            });

            if (expectedSign !== razorpay_signature) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid payment signature'
                });
            }

            // Verify payment with Razorpay
            console.log('Fetching payment details from Razorpay:', razorpay_payment_id);
            const payment = await razorpay.payments.fetch(razorpay_payment_id);
            console.log('Razorpay payment details:', payment);

            if (payment.status !== 'captured') {
                console.error('Payment not captured:', payment.status);
                return res.status(400).json({
                    success: false,
                    message: `Payment not captured. Status: ${payment.status}`
                });
            }

            // Update booking status
            booking.status = 'confirmed';
            booking.payment.payment_status = 'paid';
            booking.payment.razorpay_payment_id = razorpay_payment_id;
            booking.payment.razorpay_signature = razorpay_signature;

            console.log('Saving updated booking:', booking);
            await booking.save();

            // Send confirmation email in user's email
            try {
                const user = await Customer.findById(booking.user_id);
                console.log('Found user for email:', user?.email);

                if (user?.email) {
                    await sendMail({
                        to: user.email,
                        subject: 'Package Booking Confirmation - Makeup Munch',
                        text: `Dear ${booking.user_info.user_Fname},\n\nYour package booking has been confirmed!\n\nBooking Details:\n- Booking ID: ${booking._id}\n- Package: ${booking.package_details.package_name}\n- Date: ${new Date(booking.booking_date).toLocaleDateString()}\n- Time: ${booking.booking_time}\n- Amount Paid: ₹${booking.payment.amount / 100}\n\nThank you for choosing Makeup Munch!`
                    });
                    console.log('Confirmation email sent');
                }
            } catch (emailError) {
                console.error('Error sending confirmation email:', emailError);
            }

            return res.status(200).json({
                success: true,
                message: 'Payment verified and package booking confirmed',
                data: {
                    booking,
                    payment_id: razorpay_payment_id
                }
            });

        } catch (verificationError) {
            console.error('Verification error details:', {
                error: verificationError,
                stack: verificationError.stack,
                message: verificationError.message
            });
            return res.status(400).json({
                success: false,
                message: `Payment verification failed: ${verificationError.message}`
            });
        }

    } catch (error) {
        console.error('Package payment verification error:', {
            error,
            stack: error.stack,
            message: error.message
        });
        return res.status(500).json({
            success: false,
            message: 'Internal server error during payment verification',
            details: error.message
        });
    }
};

module.exports = {
    booking,
    packageBooking,
    getUserBookings,
    getArtistBookings,
    getAllBookings,
    getUserPackageBookings,
    verifyAndCompletePayment,
    verifyPackagePayment
};
