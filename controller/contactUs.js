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
        <div style="font-family: Arial, sans-serif;">
            <h2>Contact Us Message</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        </div>
    `;

    try {
        // Send email
        await sendMail('abhishekmishra06460@gmail.com', subject, '', html); 

        // Send success response
        return sendGeneralResponse(res, true, 'Message sent successfully', 200);
    } catch (error) {
        console.error('Error sending contact message:', error);
        return sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};

module.exports = { contactUs };
