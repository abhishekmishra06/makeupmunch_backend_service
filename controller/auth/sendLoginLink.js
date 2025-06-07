const { sendGeneralResponse } = require("../../utils/responseHelper");



const multer = require('multer');
const jwt = require('jsonwebtoken');
// const { validateEmail, validatePhone, validateRequiredFields, validateRequiredAddressFields, validateServicesFormat } = require('../../utils/validation');
const User = require('../../models/userModel');
const { sendMail } = require('../../utils/mailer');

// const { verifyPhoneOtp } = require('./otpController');



const sendLoginLink = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return sendGeneralResponse(res, false, "Email is required", 400);
    }

    try {
        const user = await User.User.findOne({ email });
        if (!user) {
            return sendGeneralResponse(res, false, "User not found", 404);
        }

        const loginToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '10m' } // Token valid for 10 minutes
        );

        console.log(loginToken);
        const loginUrl = `https://www.makeupmunch.in/login-via-link?token=${loginToken}`;

        console.log(user.username);


        const subject = "Your Secure Login Link";
        const text = ``;
        const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="background-color: white; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #FFB6C1; padding: 10px; color: white; text-align: center; border-radius: 10px 10px 0 0;">
        <h1>Login to Your Account</h1>
      </div>
      <div style="padding: 20px;">
        <h2 style="color: #333;">Hello, ${user.username}!</h2>
        <p>You requested to log in without a password. Just click the button below to securely log into your account. This link will expire in 10 minutes.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${loginUrl}" style="
            background-color: #FF69B4;
            color: white;
            padding: 15px 25px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            display: inline-block;
            font-weight: bold;
          ">
            Click to Login Securely
          </a>
        </div>

        <p style="margin-top: 30px; color: #999; font-size: 14px;">
          If you did not request this login, you can safely ignore this email.
        </p>

        <p style="margin-top: 30px;">Follow us on social media:</p>
        <div style="text-align: center; margin-top: 10px;">
          <a href="https://www.facebook.com/yourpage" style="margin-right: 10px;">
            <img src="https://img.icons8.com/ios-filled/24/FF69B4/facebook-new.png" alt="Facebook" />
          </a>
          <a href="https://www.instagram.com/yourpage" style="margin-right: 10px;">
            <img src="https://img.icons8.com/ios-filled/24/FF69B4/instagram-new.png" alt="Instagram" />
          </a>
          <a href="mailto:support@yourservice.com">
            <img src="https://img.icons8.com/ios-filled/24/FF69B4/support.png" alt="Support" />
          </a>
        </div>
      </div>
      <div style="margin-top: 20px; text-align: center; color: #777; font-size: 12px;">
        <p>&copy; 2024 Our Service. All Rights Reserved.</p>
      </div>
    </div>
  </div>
`;



        // Send email (pseudo-code)

        await sendMail({
            to: email,
            subject,
            text: text,
            html
        });

        return sendGeneralResponse(res, true, "Login link sent to your email", 200);
    } catch (error) {
        console.error("Error sending login link:", error);
        return sendGeneralResponse(res, false, "Internal server error", 500);
    }
};


module.exports = { sendLoginLink };