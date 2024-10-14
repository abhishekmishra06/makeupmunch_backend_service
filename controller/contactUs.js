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
    const subject = 'New Contact Us Message';
    const html = `
    <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9;">
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; padding: 20px;">
            <tr>
                <td style="border-bottom: 2px solid #e4e4e4; text-align: center; padding-bottom: 20px;">
                    <h2 style="color: #333333; font-size: 24px; margin: 0;">Contact Us Message</h2>
                </td>
            </tr>
            <tr>
                <td>
                    <div style="padding: 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                        <p><strong style="color: #333333;">Name:</strong> ${name}</p>
                        <p><strong style="color: #333333;">Email:</strong> ${email}</p>
                        <p><strong style="color: #333333;">Message:</strong></p>
                        <p style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; color: #333333;">
                            ${message}
                        </p>
                    </div>
                </td>
            </tr>
            <tr>
                <td style="border-top: 2px solid #e4e4e4; padding-top: 20px; text-align: center;">
                    <p style="color: #888888; font-size: 14px;">Thank you for reaching out! We will get back to you soon.</p>
                </td>
            </tr>
        </table>
    </div>
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
