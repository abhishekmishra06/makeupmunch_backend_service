const express = require('express');
const { sendGeneralResponse } = require('../utils/responseHelper');
const { sendMail } = require('../utils/mailer');
const { validateEmail } = require('../utils/validation');
 

const contactUs = async (req, res) => {
    const { name, email, message } = req.body;

     if (!name || !email || !message) {
        return sendGeneralResponse(res, false, 'Name, email, and message are required', 400);
    }

 

    if (!validateEmail(email)) {
        return sendGeneralResponse(res, false, 'Invalid email', 400);
    }

    // Prepare email content
    const subject = 'New Contact Us Message from Makeup Munch';
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Message - Makeup Munch</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #FFF0F5;">
        <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <tr>
                <td style="background-color: #FF1493; text-align: center; padding: 30px;">
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0;">New Contact Message</h1>
                </td>
            </tr>
            <tr>
                <td style="padding: 30px;">
                    <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">A new message has been received from the Makeup Munch contact form:</p>
                    <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #FFF0F5; border-radius: 5px; overflow: hidden;">
                        <tr>
                            <td style="padding: 15px;">
                                <p style="margin: 0 0 10px;"><strong style="color: #FF1493;">Name:</strong> ${name}</p>
                                <p style="margin: 0 0 10px;"><strong style="color: #FF1493;">Email:</strong> ${email}</p>
                                <p style="margin: 0 0 10px;"><strong style="color: #FF1493;">Message:</strong></p>
                                <p style="background-color: #ffffff; padding: 15px; border-radius: 5px; color: #333333; margin: 0;">
                                    ${message}
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="background-color: #FFB6C1; padding: 20px; text-align: center;">
                    <p style="color: #333333; font-size: 14px; margin: 0;">Thank you for your attention. Please respond to this inquiry promptly.</p>
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


    try {
        // Send email
        await sendMail('techmakeupmunch@gmail.com', subject, '', html); 

        // Send success response
        return sendGeneralResponse(res, true, 'Message sent successfully', 200);
    } catch (error) {
        console.error('Error sending contact message:', error);
        return sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};

module.exports = { contactUs };
