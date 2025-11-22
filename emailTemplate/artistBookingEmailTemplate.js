 
const artistBookingEmailTemplate = (user_info, artist_info, service_details, totalAmount, booking_date, booking_time) => {
    const subject = 'New Booking Received - Makeup Munch';

    // Generate a list of services and sub-services for the artist
    const servicesList = service_details.map(service => {
        return `
            <p style="margin: 0 0 10px;">
                <strong style="color: #FF1493;">Service:</strong> ${service.serviceName}<br>
                <strong style="color: #FF1493;">Selected Sub-Services:</strong>
                <ul>
                    ${service.selected_services.map(subService => `<li>${subService.subService_name} - ${subService.price} x ${subService.quantity}</li>`).join('')}
                </ul>
            </p>
        `;
    }).join('');

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Received - Makeup Munch</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #FFF0F5;">
        <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <tr>
                <td style="background-color: #FF1493; text-align: center; padding: 30px;">
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0;">New Booking Received</h1>
                </td>
            </tr>
            <tr>
                <td style="padding: 30px;">
                    <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">Hello, ${artist_info.username}!</p>
                    <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">You have received a new booking with the following details:</p>
                    <p style="font-size: 16px; color: #333333; margin-bottom: 10px;">
                        <strong style="color: #FF1493;">Customer Name:</strong> ${user_info.username}<br>
                        <strong style="color: #FF1493;">Date:</strong> ${booking_date}<br>
                        <strong style="color: #FF1493;">Time:</strong> ${booking_time}
                    </p>
                    ${servicesList}
                    <p style="font-size: 16px; color: #333333; margin-top: 20px;">
                        <strong style="color: #FF1493;">Total Amount:</strong> ${totalAmount}
                    </p>
                </td>
            </tr>
            <tr>
                <td style="background-color: #FFB6C1; padding: 20px; text-align: center;">
                    <p style="color: #333333; font-size: 14px; margin: 0;">Please be prepared to attend to the customer’s booking. If you have any questions, reach out to us.</p>
                </td>
            </tr>
            <tr>
                <td style="padding: 20px; text-align: center;">
                    <a href="https://www.makeupmunch.in" style="display: inline-block; background-color: #FF1493; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">View Your Booking</a>
                </td>
            </tr>
            <tr>
                <td style="padding: 20px; text-align: center;">
                    <p style="color: #888888; font-size: 12px; margin: 0;">&copy; 2025 Makeup Munch. All Rights Reserved.</p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    return { subject, html };
};

module.exports = artistBookingEmailTemplate;
