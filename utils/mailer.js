const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',  
    auth: {
        user: process.env.EMAIL_USER,  
        pass: process.env.EMAIL_PASS 
    }
});

const sendMail = async ({ to, subject, text, html }) => {
    if (!to || !subject) {
        throw new Error("Missing email parameters");
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            text: text || 'This is an HTML email',
            html: html
        };

        // console.log('Sending email with options:', mailOptions);

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        return info;
    } catch (error) {
        console.error('Error in sendMail:', error);
        throw error;
    }
};

// const sendSubscribeMail = async (to, subject, text) => {
//     try {
//         await transporter.sendMail({
//             from: process.env.EMAIL_USER,
//             to,
//             subject,
//             // text
        //     html: `<h1>Thank You for Subscribing!</h1>
        //     <p>We are excited to share the latest beauty tips and exclusive offers with you.</p>
        //     <p>Stay tuned!</p>`,
        // });
//     } catch (error) {
//         console.error('Error sending email:', error);
//         throw error; 
//     }
// };

module.exports = { sendMail };
 