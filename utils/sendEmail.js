const { sendMail } = require('./mailer');

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    return await sendMail({ to, subject, text, html });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail; 