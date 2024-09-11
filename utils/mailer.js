const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services like 'SendGrid', 'Mailgun', etc.
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS  // Your email password or app password
    }
});

// const sendMail = (to, subject, text) => {
//     return transporter.sendMail({
//         from: process.env.EMAIL_USER,
//         to, 
//         subject,
//         text
//     });
// };


const sendMail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        });
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; 
    }
};

module.exports = { sendMail };
 