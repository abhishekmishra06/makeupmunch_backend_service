const { Booking, PackageBooking } = require('../models/bookingModel');
const { sendGeneralResponse } = require('../utils/responseHelper');
const { sendMail } = require('../utils/mailer');
const { User, Customer, Artist } = require('../models/userModel');

// Calculate cancellation fee based on booking time
const calculateCancellationFee = (bookingCreatedAt, totalAmount) => {
    const now = new Date();
    const bookingTime = new Date(bookingCreatedAt);
    const hoursDifference = (now - bookingTime) / (1000 * 60 * 60); // Convert to hours

    // If cancellation is within 1 hour of booking, no fee
    if (hoursDifference <= 1) {
        return {
            cancellationFee: 0,
            refundAmount: totalAmount,
            hoursDifference: hoursDifference
        };
    } else {
        // If cancellation is after 1 hour, charge 5% fee
        const cancellationFee = totalAmount * 0.05;
        const refundAmount = totalAmount - cancellationFee;
        return {
            cancellationFee: cancellationFee,
            refundAmount: refundAmount,
            hoursDifference: hoursDifference
        };
    }
};

// Cancel regular booking
const cancelBooking = async (req, res) => {
    try {
        const { booking_id, cancelled_by, cancellation_reason } = req.body;
        const userId = req.user?.id || req.body.user_id;

        // Debug logs
        console.log('Cancellation request received:', {
            booking_id,
            cancelled_by,
            cancellation_reason,
            userId,
            requestBody: req.body
        });

        // Validate required fields
        if (!booking_id || !cancelled_by || !cancellation_reason) {
            return sendGeneralResponse(res, false, 'Missing required fields: booking_id, cancelled_by, and cancellation_reason', 400);
        }

        // Validate cancelled_by value
        if (!['user', 'artist'].includes(cancelled_by)) {
            return sendGeneralResponse(res, false, 'cancelled_by must be either "user" or "artist"', 400);
        }

        // Find the booking
        const booking = await Booking.findById(booking_id)
            .populate('user_id', 'name email phone')
            .populate('artist_id', 'name email phone');

        if (!booking) {
            return sendGeneralResponse(res, false, 'Booking not found', 404);
        }

        // Check if booking is already cancelled
        if (booking.status === 'cancelled') {
            return sendGeneralResponse(res, false, 'Booking is already cancelled', 400);
        }

        // Check if booking is completed
        if (booking.status === 'completed') {
            return sendGeneralResponse(res, false, 'Cannot cancel a completed booking', 400);
        }

        // Authorization check - ensure user can cancel this booking
        if (cancelled_by === 'user') {
            // Extract user ID from object if needed
            let requestUserId = userId;
            if (typeof requestUserId === 'object' && requestUserId._id) {
                requestUserId = requestUserId._id;
            }

            // Check if user can cancel this booking
            if (!booking.user_id) {
                return sendGeneralResponse(res, false, 'No user associated with this booking', 400);
            }

            let bookingUserId = booking.user_id;
            if (typeof bookingUserId === 'object' && bookingUserId._id) {
                bookingUserId = bookingUserId._id.toString();
            } else {
                bookingUserId = bookingUserId.toString();
            }

            if (bookingUserId !== requestUserId.toString()) {
                return sendGeneralResponse(res, false, 'You can only cancel your own bookings', 403);
            }
        } else if (cancelled_by === 'artist') {
            // For artist cancellations, check if artist is assigned
            console.log('Artist cancellation debug:', {
                booking_artist_id: booking.artist_id,
                booking_artist_id_type: typeof booking.artist_id,
                request_userId: userId,
                userId_type: typeof userId,
                booking_complete: JSON.stringify(booking, null, 2)
            });

            if (!booking.artist_id) {
                console.log('ERROR: No artist assigned to this booking. Booking details:', {
                    booking_id: booking._id,
                    status: booking.status,
                    user_id: booking.user_id,
                    artist_id: booking.artist_id,
                    booking_date: booking.booking_date
                });

                // For now, let's allow artist to cancel even if artist_id is not set
                // This might happen if the artist_id field was not properly populated during booking creation
                console.log('Allowing artist cancellation despite missing artist_id');
            } else {
                // Extract artist ID properly
                let bookingArtistId = booking.artist_id;
                if (typeof bookingArtistId === 'object' && bookingArtistId._id) {
                    bookingArtistId = bookingArtistId._id.toString();
                } else {
                    bookingArtistId = bookingArtistId.toString();
                }

                // Extract request user ID properly
                let requestUserId = userId;
                if (typeof requestUserId === 'object' && requestUserId._id) {
                    requestUserId = requestUserId._id.toString();
                } else {
                    requestUserId = requestUserId.toString();
                }

                console.log('Artist ID comparison:', {
                    bookingArtistId,
                    requestUserId,
                    match: bookingArtistId === requestUserId
                });

                if (bookingArtistId !== requestUserId) {
                    return sendGeneralResponse(res, false, 'Artists can only cancel their own bookings', 403);
                }
            }
        }

        // Calculate refund and fees based on who is cancelling
        let refundAmount = 0;
        let feeCalculation = null;

        if (cancelled_by === 'user') {
            // User cancellation - calculate refund based on booking type
            if (booking.booking_type === 'package') {
                // Package booking cancellation calculation
                refundAmount = booking.payment?.total_amount || 0;
                feeCalculation = calculateCancellationFee(booking.createdAt, booking.payment?.total_amount || 0);

                if (feeCalculation.cancellationFee > 0) {
                    refundAmount = refundAmount - feeCalculation.cancellationFee;
                }
            } else {
                // Regular booking cancellation calculation
                refundAmount = booking.payment?.total_amount || 0;
                feeCalculation = calculateCancellationFee(booking.createdAt, booking.payment?.total_amount || 0);

                if (feeCalculation.cancellationFee > 0) {
                    refundAmount = refundAmount - feeCalculation.cancellationFee;
                }
            }
        } else if (cancelled_by === 'artist') {
            // Artist cancellation - full refund, no fee
            refundAmount = booking.payment?.total_amount || 0;
            feeCalculation = { cancellationFee: 0, refundAmount: refundAmount };
        }

        // Update booking with cancellation details
        booking.status = 'cancelled';
        booking.cancellation = {
            cancelled_by: cancelled_by,
            cancellation_reason: cancellation_reason,
            cancellation_date: new Date(),
            cancellation_fee: feeCalculation.cancellationFee,
            refund_amount: refundAmount,
            cancellation_status: 'pending'
        };

        await booking.save();

        // Send notification emails
        try {
            // const customerEmail = booking.user_id?.email;
            // const artistEmail = booking.artist_id?.email;
            // const bookingDate = new Date(booking.booking_date).toLocaleDateString();

            const customerEmail = booking.user_id?.email;
            const artistEmail = booking.artist_id?.email;

            // Helper data for email templates
            const userName = booking.user_id?.name || booking.user_info?.user_Fname || 'Customer';
            const artistName = booking.artist_id?.name || 'Artist';
            const bookingDateStr = new Date(booking.booking_date).toLocaleDateString();
            const isPackageBooking = booking.booking_type === 'package';
            const bookingTime = booking.booking_time;
            const deduction = feeCalculation.cancellationFee || 0;

            // Email to customer
            if (cancelled_by === 'user' && customerEmail) {
                const subject = 'Booking Cancelled - Makeup Munch';


                const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="background-color: #fff; max-width: 600px; margin: auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden;">
      <div style="background-color: #FF6B6B; padding: 20px; color: white; text-align: center;">
        <h1 style="margin: 0;">Booking Cancelled</h1>
      </div>
      <div style="padding: 20px; color: #333;">
        <h2>Hi ${userName},</h2>
        <p>Your booking has been cancelled successfully. Below are the details:</p>
        <ul style="line-height: 1.6;">
          <li><strong>Booking ID:</strong> ${booking._id}</li>
          <li><strong>Date:</strong> ${bookingDateStr}</li>
          <li><strong>Time:</strong> ${bookingTime}</li>
          <li><strong>Cancelled By:</strong> You</li>
        </ul>

        <p style="margin-top: 20px;">
          ${deduction > 0
                        ? `As per our cancellation policy, a <strong>10% deduction</strong> has been applied. 
            The remaining amount of <strong>₹${refundAmount.toFixed(2)}</strong> has been refunded to your original payment method.`
                        : `You are eligible for a <strong>full refund of ₹${refundAmount.toFixed(2)}</strong>.`}
        </p>

        <p>The refund will reflect in your bank account within <strong>4–5 working days</strong>.</p>

        <hr style="margin: 30px 0;">
        <p style="margin: 0;">Need help? Contact us at <a href="mailto:techmakeupmunch@gmail.com">techmakeupmunch@gmail.com</a></p>
        <div style="margin-top: 20px; text-align: center;">
          <a href="https://www.facebook.com/profile.php?id=61576604952593" style="margin: 0 10px;">
            <img src="https://img.icons8.com/ios-filled/24/FF6B6B/facebook-new.png" alt="Facebook" />
          </a>
          <a href="https://www.instagram.com/makeupmunch_official" style="margin: 0 10px;">
            <img src="https://img.icons8.com/ios-filled/24/FF6B6B/instagram-new.png" alt="Instagram" />
          </a>
          <a href="mailto:techmakeupmunch@gmail.com" style="margin: 0 10px;">
            <img src="https://img.icons8.com/ios-filled/24/FF6B6B/support.png" alt="Support" />
          </a>
        </div>
      </div>
    </div>
  </div>
`;

                await sendMail({
                    to: customerEmail,
                    subject: subject,
                    text: "",
                    html: html
                });


            } if (cancelled_by === 'artist' && customerEmail) {
                // Artist cancelled email (to user)
                const userSubject = 'Booking Cancelled by Artist - Makeup Munch';



                const userHtml = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="background-color: #fff; max-width: 600px; margin: auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden;">
      <div style="background-color: #FF6F61; padding: 20px; color: white; text-align: center;">
        <h1 style="margin: 0;">Booking Cancelled by Artist</h1>
      </div>
      <div style="padding: 20px; color: #333;">
        <h2>Hi ${userName},</h2>
        <p>We’re sorry to let you know that your booking has been cancelled by the artist. Here are the details:</p>
        <ul style="line-height: 1.6;">
          <li><strong>Booking ID:</strong> ${booking._id}</li>
          <li><strong>Artist:</strong> ${artistName}</li>
          <li><strong>Date:</strong> ${bookingDateStr}</li>
          <li><strong>Time:</strong> ${bookingTime}</li>
         </ul>
        <p>If you’ve made a payment, it will be refunded to your account within 4-5 working days.</p>
        <a href="https://www.makeupmunch.in/userdashboard" style="display: inline-block; background-color: #FF6F61; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Go to Dashboard</a>
        <hr style="margin: 30px 0;">
        <p style="margin: 0;">Need help? Contact us at <a href="mailto:techmakeupmunch@gmail.com">techmakeupmunch@gmail.com</a></p>
      </div>
    </div>
  </div>
`;

                await sendMail({
                    to: customerEmail,
                    subject: userSubject,
                    text: "",
                    html: userHtml
                });
            }


            // Email to artist
            if (artistEmail) {

                if (cancelled_by === 'artist') {
                    // Email when artist cancels
                    const artistSubject = 'You Cancelled a Booking - Confirmation - Makeup Munch';



                    const artistHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="background-color: #fff; max-width: 600px; margin: auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background-color: #D2691E; padding: 20px; color: white; text-align: center;">
            <h1 style="margin: 0;">Booking Cancellation Confirmed</h1>
          </div>
          <div style="padding: 20px; color: #333;">
            <h2>Hi ${artistName},</h2>
            <p>This is to confirm that you have cancelled the following booking:</p>
            <ul style="line-height: 1.6;">
              <li><strong>Booking ID:</strong> ${booking._id}</li>
              <li><strong>User:</strong> ${userName}</li>
              <li><strong>Date:</strong> ${new Date(booking.booking_date).toLocaleDateString()}</li>
              <li><strong>Time:</strong> ${booking.booking_time}</li>
             </ul>
            <p>If this was a mistake, kindly reach out to the Makeup Munch team immediately.</p>
            <hr style="margin: 30px 0;">
            <p style="margin: 0;">Support: <a href="mailto:techmakeupmunch@gmail.com">techmakeupmunch@gmail.com</a></p>
          </div>
        </div>
      </div>
    `;

                    await sendMail({
                        to: artistEmail,
                        subject: artistSubject,
                        text: '',
                        html: artistHtml,
                    });

                } else if (cancelled_by === 'user') {
                    // Email when user cancels
                    const artistSubject = 'User Cancelled Booking - Makeup Munch';


                    const artistHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="background-color: #fff; max-width: 600px; margin: auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background-color: #FFA07A; padding: 20px; color: white; text-align: center;">
            <h1 style="margin: 0;">Booking Cancelled by User</h1>
          </div>
          <div style="padding: 20px; color: #333;">
            <h2>Hi ${artistName},</h2>
            <p>We would like to inform you that the following booking has been cancelled by the user:</p>
            <ul style="line-height: 1.6;">
              <li><strong>Booking ID:</strong> ${booking._id}</li>
              <li><strong>User:</strong> ${userName}</li>
              <li><strong>Date:</strong> ${new Date(booking.booking_date).toLocaleDateString()}</li>
              <li><strong>Time:</strong> ${booking.booking_time}</li>
             </ul>
            <p>Please log in to your <a href="https://www.makeupmunch.in/artistdashboard">artist dashboard</a> for full booking details.</p>
            <hr style="margin: 30px 0;">
            <p style="margin: 0;">Need help? Contact us at <a href="mailto:techmakeupmunch@gmail.com">techmakeupmunch@gmail.com</a></p>
            <div style="margin-top: 20px; text-align: center;">
              <a href="https://www.facebook.com/profile.php?id=61576604952593" style="margin: 0 10px;">
                <img src="https://img.icons8.com/ios-filled/24/FFA07A/facebook-new.png" alt="Facebook" />
              </a>
              <a href="https://www.instagram.com/makeupmunch_official" style="margin: 0 10px;">
                <img src="https://img.icons8.com/ios-filled/24/FFA07A/instagram-new.png" alt="Instagram" />
              </a>
              <a href="mailto:techmakeupmunch@gmail.com" style="margin: 0 10px;">
                <img src="https://img.icons8.com/ios-filled/24/FFA07A/support.png" alt="Support" />
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

                    await sendMail({
                        to: artistEmail,
                        subject: artistSubject,
                        text: '',
                        html: artistHtml,
                    });
                }

                // await sendMail(
                //     artistEmail,
                //     'Booking Cancellation Notification',
                //     `
                //     <h2>Booking Cancellation Notification</h2>
                //     <p>A booking scheduled for ${bookingDate} at ${booking.booking_time} has been cancelled.</p>
                //     <p><strong>Cancelled by:</strong> ${cancelled_by === 'user' ? 'Customer' : 'You'}</p>
                //     <p><strong>Reason:</strong> ${cancellation_reason}</p>
                //     <p><strong>Customer:</strong> ${booking.user_info?.user_Fname || 'N/A'} ${booking.user_info?.user_Lname || ''}</p>
                //     <p>Please update your schedule accordingly.</p>
                //     `
                // );
            }
        } catch (emailError) {
            console.error('Error sending cancellation emails:', emailError);
            // Don't fail the cancellation if email fails
        }

        return sendGeneralResponse(res, true, 'Booking cancelled successfully', 200, {
            booking_id: booking._id,
            status: booking.status,
            cancellation_details: booking.cancellation,
            fee_calculation: feeCalculation
        });

    } catch (error) {
        console.error('Error cancelling booking:', error);
        return sendGeneralResponse(res, false, error.message || 'Internal server error', 500);
    }
};




// Cancel package booking
const cancelPackageBooking = async (req, res) => {
    try {
        const { booking_id, cancelled_by, cancellation_reason } = req.body;
        const userId = req.user?.id || req.body.user_id;

        // Validate required fields
        if (!booking_id || !cancelled_by || !cancellation_reason) {
            return sendGeneralResponse(res, false, 'Missing required fields: booking_id, cancelled_by, and cancellation_reason', 400);
        }

        // Validate cancelled_by value
        if (!['user', 'artist'].includes(cancelled_by)) {
            return sendGeneralResponse(res, false, 'cancelled_by must be either "user" or "artist"', 400);
        }

        // Find the package booking
        const booking = await PackageBooking.findById(booking_id)
            .populate('user_id', 'name email phone');

        if (!booking) {
            return sendGeneralResponse(res, false, 'Package booking not found', 404);
        }

        // Check if booking is already cancelled
        if (booking.status === 'cancelled') {
            return sendGeneralResponse(res, false, 'Package booking is already cancelled', 400);
        }

        // Authorization check for user cancellations
        if (cancelled_by === 'user') {
            // Extract user ID from object if needed
            let requestUserId = userId;
            if (typeof requestUserId === 'object' && requestUserId._id) {
                requestUserId = requestUserId._id;
            }

            // Check if user can cancel this booking
            if (!booking.user_id) {
                return sendGeneralResponse(res, false, 'No user associated with this booking', 400);
            }

            let bookingUserId = booking.user_id;
            if (typeof bookingUserId === 'object' && bookingUserId._id) {
                bookingUserId = bookingUserId._id.toString();
            } else {
                bookingUserId = bookingUserId.toString();
            }

            if (bookingUserId !== requestUserId.toString()) {
                return sendGeneralResponse(res, false, 'You can only cancel your own bookings', 403);
            }
        }

        // Calculate refund and fees based on who is cancelling
        let refundAmount = 0;
        let feeCalculation = null;

        if (cancelled_by === 'user') {
            // User cancellation - calculate refund based on booking type
            if (booking.booking_type === 'package') {
                // Package booking cancellation calculation
                refundAmount = booking.payment?.total_amount || 0;
                feeCalculation = calculateCancellationFee(booking.createdAt, booking.payment?.total_amount || 0);

                if (feeCalculation.cancellationFee > 0) {
                    refundAmount = refundAmount - feeCalculation.cancellationFee;
                }
            } else {
                // Regular booking cancellation calculation
                refundAmount = booking.payment?.total_amount || 0;
                feeCalculation = calculateCancellationFee(booking.createdAt, booking.payment?.total_amount || 0);

                if (feeCalculation.cancellationFee > 0) {
                    refundAmount = refundAmount - feeCalculation.cancellationFee;
                }
            }
        } else if (cancelled_by === 'artist') {
            // Artist cancellation - full refund, no fee
            refundAmount = booking.payment?.total_amount || 0;
            feeCalculation = { cancellationFee: 0, refundAmount: refundAmount };
        }

        // Update booking with cancellation details
        booking.status = 'cancelled';
        booking.cancellation = {
            cancelled_by: cancelled_by,
            cancellation_reason: cancellation_reason,
            cancellation_date: new Date(),
            cancellation_fee: feeCalculation.cancellationFee,
            refund_amount: refundAmount,
            cancellation_status: 'pending'
        };

        await booking.save();

        // Send notification email to customer
        try {
            const customerEmail = booking.user_id?.email;
            const bookingDate = new Date(booking.booking_date).toLocaleDateString();
            const userName = booking.user_id?.name || booking.user_info?.user_Fname || 'Customer';

            if (customerEmail) {

                const userSubject = 'Package Booking Cancellation Confirmation - Makeup Munch';

                const userHtml = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="background-color: #fff; max-width: 600px; margin: auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden;">
      <div style="background-color: #FF6B6B; padding: 20px; color: white; text-align: center;">
        <h1 style="margin: 0;">Package Booking Cancelled</h1>
      </div>
      <div style="padding: 20px; color: #333;">
        <h2>Hi ${userName},</h2>
        <p>Your package booking "<strong>${booking.package_details?.package_name || 'N/A'}</strong>" for <strong>${bookingDate}</strong> at <strong>${booking.booking_time}</strong> has been cancelled successfully.</p>
        <ul style="line-height: 1.6;">
          <li><strong>Cancellation Reason:</strong> ${cancellation_reason}</li>
          <li><strong>Cancellation Fee:</strong> ₹${feeCalculation.cancellationFee.toFixed(2)}</li>
          <li><strong>Refund Amount:</strong> ₹${refundAmount.toFixed(2)}</li>
        </ul>
        <p>Your refund will be processed within <strong>5-7 business days</strong> to your original payment method.</p>

        <hr style="margin: 30px 0;">
        <p style="margin: 0;">If you need any help, please contact us at <a href="mailto:techmakeupmunch@gmail.com">techmakeupmunch@gmail.com</a></p>
        <div style="margin-top: 20px; text-align: center;">
          <a href="https://www.facebook.com/profile.php?id=61576604952593" style="margin: 0 10px;">
            <img src="https://img.icons8.com/ios-filled/24/FF6B6B/facebook-new.png" alt="Facebook" />
          </a>
          <a href="https://www.instagram.com/makeupmunch_official" style="margin: 0 10px;">
            <img src="https://img.icons8.com/ios-filled/24/FF6B6B/instagram-new.png" alt="Instagram" />
          </a>
          <a href="mailto:techmakeupmunch@gmail.com" style="margin: 0 10px;">
            <img src="https://img.icons8.com/ios-filled/24/FF6B6B/support.png" alt="Support" />
          </a>
        </div>
      </div>
    </div>
  </div>
`;


                await sendMail({
                    to: customerEmail,
                    subject: userSubject,
                    text: '',
                    html: userHtml,
                });


                const subjectInternal = 'Package Booking Cancelled by User - Makeup Munch';

                const htmlInternal = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="background-color: #fff; max-width: 600px; margin: auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden;">
      <div style="background-color: #FF6B6B; padding: 20px; color: white; text-align: center;">
        <h1 style="margin: 0;">User Cancelled Package Booking</h1>
      </div>
      <div style="padding: 20px; color: #333;">
        <h2>Hi Team,</h2>
        <p>The following package booking has been cancelled by the user:</p>
        <ul style="line-height: 1.6;">
          <li><strong>Booking ID:</strong> ${booking._id}</li>
          <li><strong>User:</strong> ${userName} (${customerEmail})</li>
          <li><strong>Package Name:</strong> ${booking.package_details?.package_name || 'N/A'}</li>
          <li><strong>Booking Date:</strong> ${bookingDate}</li>
          <li><strong>Booking Time:</strong> ${booking.booking_time}</li>
          <li><strong>Cancellation Reason:</strong> ${cancellation_reason}</li>
          <li><strong>Cancellation Fee:</strong> ₹${feeCalculation.cancellationFee.toFixed(2)}</li>
          <li><strong>Refund Amount:</strong> ₹${refundAmount.toFixed(2)}</li>
        </ul>
        <p>Please ensure the refund process is completed within 5-7 business days.</p>
        <hr style="margin: 30px 0;">
        <p style="margin: 0;">For questions, contact the support team.</p>
      </div>
    </div>
  </div>
`;


                await sendMail({
                    to: 'techmakeupmunch@gmail.com',
                    subject: subjectInternal,
                    text: '',
                    html: htmlInternal,
                });



                // await sendMail(
                //     customerEmail,
                //     'Package Booking Cancellation Confirmation',
                //     `
                //     <h2>Package Booking Cancellation Notification</h2>
                //     <p>Your package booking "${booking.package_details?.package_name || 'N/A'}" for ${bookingDate} at ${booking.booking_time} has been cancelled.</p>
                //     <p><strong>Cancelled by:</strong> ${cancelled_by === 'user' ? 'You' : 'Service Provider'}</p>
                //     <p><strong>Reason:</strong> ${cancellation_reason}</p>
                //     ${cancelled_by === 'user' ? `
                //         <p><strong>Cancellation Fee:</strong> ₹${feeCalculation.cancellationFee.toFixed(2)}</p>
                //         <p><strong>Refund Amount:</strong> ₹${refundAmount.toFixed(2)}</p>
                //         <p><em>Your refund will be processed within 5-7 business days.</em></p>
                //     ` : `
                //         <p><strong>Refund Amount:</strong> ₹${refundAmount.toFixed(2)}</p>
                //         <p><em>Your full refund will be processed within 5-7 business days.</em></p>
                //     `}
                //     <p>We apologize for any inconvenience caused.</p>
                //     `
                // );
            }
        } catch (emailError) {
            console.error('Error sending cancellation email:', emailError);
            // Don't fail the cancellation if email fails
        }

        return sendGeneralResponse(res, true, 'Package booking cancelled successfully', 200, {
            booking_id: booking._id,
            status: booking.status,
            cancellation_details: booking.cancellation,
            fee_calculation: feeCalculation
        });

    } catch (error) {
        console.error('Error cancelling package booking:', error);
        return sendGeneralResponse(res, false, error.message || 'Internal server error', 500);
    }
};

// Get cancellation details
const getCancellationDetails = async (req, res) => {
    try {
        const { booking_id, booking_type } = req.params; // booking_type: 'regular' or 'package'

        let booking;
        if (booking_type === 'package') {
            booking = await PackageBooking.findById(booking_id);
        } else {
            booking = await Booking.findById(booking_id);
        }

        if (!booking) {
            return sendGeneralResponse(res, false, 'Booking not found', 404);
        }

        if (booking.status !== 'cancelled') {
            return sendGeneralResponse(res, false, 'Booking is not cancelled', 400);
        }

        return sendGeneralResponse(res, true, 'Cancellation details retrieved successfully', 200, {
            booking_id: booking._id,
            cancellation_details: booking.cancellation,
            original_amount: booking.payment.total_amount
        });

    } catch (error) {
        console.error('Error fetching cancellation details:', error);
        return sendGeneralResponse(res, false, error.message || 'Internal server error', 500);
    }
};

module.exports = {
    cancelBooking,
    cancelPackageBooking,
    getCancellationDetails,
    calculateCancellationFee
}; 