const { sendMail } = require("../utils/mailer");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const crypto = require("crypto");
const { sendSMS } = require("../utils/sms");
const { sendGeneralResponse } = require("../utils/responseHelper");
const { validateEmail, validatePhone } = require("../utils/validation");
const Otp = require("../models/otp_model");

const sendEmailOtp = async (req, res) => {
  console.log("call send email api")
  const { email } = req.body;

  // Check if email is provided
  if (!email) {
    return sendGeneralResponse(res, false, "Email is required", 400);
  }

  // Validate email format
  if (!validateEmail(email)) {
    return sendGeneralResponse(res, false, "Invalid email", 400);
  }

  try {
    // Generate OTP and hash it
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = Date.now() + 25 * 60 * 1000; // OTP valid for 15 minutes

    // Delete any existing OTP entries for the email
    await Otp.deleteMany({ email });

    // Upsert OTP entry in the database
    await Otp.findOneAndUpdate(
      { email },
      { otpHash, expiresAt },
      { upsert: true, new: true }
    );

    // Email subject and HTML content
    const subject = "Your Makeup Munch Verification Code";
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Makeup Munch Verification Code</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #FFF0F5; margin: 0; padding: 20px;">
    <div style="background-color: white; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 20px rgba(255, 20, 147, 0.1);">
        <div style="background-color: #FF1493; padding: 20px; color: white; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Your Makeup Munch Verification Code</h1>
        </div>
        <div style="padding: 30px; background-color: #FFFFFF;">
            <h2 style="color: #FF1493; margin-top: 0;">Hello, Beauty Enthusiast!</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.5;">Your One-Time Password (OTP) for Makeup Munch is:</p>
            <div style="background-color: #FFF0F5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                <h1 style="font-size: 36px; color: #FF1493; margin: 0;">${otp}</h1>
            </div>
            <p style="color: #333; font-size: 16px; line-height: 1.5;">This code is valid for the next 15 minutes. Please enter it on the verification page to continue your beauty journey with us.</p>
            <p style="color: #333; font-size: 16px; line-height: 1.5;">If you didn't request this code, please ignore this email. Your account's security is important to us.</p>
        </div>
        <div style="background-color: #FFB6C1; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 14px; margin: 0;">Follow us for daily beauty inspiration:</p>
            <div style="margin-top: 10px;">
                <a href="#" style="text-decoration: none; margin: 0 10px;">
                    <img src="https://img.icons8.com/ios-filled/30/FF1493/facebook-new.png" alt="Facebook" />
                </a>
                <a href="#" style="text-decoration: none; margin: 0 10px;">
                    <img src="https://img.icons8.com/ios-filled/30/FF1493/instagram-new.png" alt="Instagram" />
                </a>
                <a href="#" style="text-decoration: none; margin: 0 10px;">
                    <img src="https://img.icons8.com/ios-filled/30/FF1493/twitter.png" alt="Twitter" />
                </a>
            </div>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #777; font-size: 12px;">
            <p>&copy; 2024 Makeup Munch. All Rights Reserved.</p>
        </div>
    </div>
</body>
</html>
`;

    // Send the email
    await sendMail({
      to: email,
      subject: subject,
      text: "",
      html: html
    });

    // Send success response
    sendGeneralResponse(res, true, "OTP sent to email", 200);
  } catch (error) {
    console.error("Error sending OTP:", error);
    sendGeneralResponse(res, false, "Internal server error", 500);
  }
};

const sendPhoneOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return sendGeneralResponse(res, false, "phone no is required", 400);
  }

  if (!validatePhone(phone)) {
    return sendGeneralResponse(res, false, "Invalid phone number", 400);
  }

  try {
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = Date.now() + 15 * 60 * 1000;

    await Otp.deleteMany({ phone });

    const otpEntry = await Otp.findOneAndUpdate(
      { phone },
      { otpHash, expiresAt, email: null },
      { upsert: true, new: true }
    );
 
 await  sendSMS(phone , otp);
    console.log(otp);
    sendGeneralResponse(res, true, "OTP sent to phone no", 200, { otp });
  } catch (error) {
    console.error("Error sending OTP:", error.message || error);
    sendGeneralResponse(res, false, "Internal server error", 500);
  }
};





const verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;

  // Check if email is provided
  if (!email) {
    return sendGeneralResponse(res, false, "Email is required", 400);
  }

  // Check if OTP is provided
  if (!otp) {
    return sendGeneralResponse(res, false, "OTP is required", 400);
  }

  // Validate email format
  if (!validateEmail(email)) {
    return sendGeneralResponse(res, false, "Invalid email", 400);
  }

  try {
    // Find OTP entry in the database
    const otpEntry = await Otp.findOne({ email });

    // Check if OTP entry exists
    if (!otpEntry) {
      return sendGeneralResponse(res, false, "Please request a new OTP", 400);
    }

    const { otpHash, expiresAt } = otpEntry;

    // Log current time and expiration time for debugging
    console.log("Current Time:", Date.now());
    console.log("OTP Expiration Time:", expiresAt);

    // Check if OTP has expired
    if (Date.now() > expiresAt) {
      // Clean up expired OTP
      await Otp.deleteMany({ email });
      return sendGeneralResponse(
        res,
        false,
        "The OTP has expired. Please request a new one.",
        400
      );
    }

    // Compare provided OTP with stored OTP hash
    const isValid = await bcrypt.compare(otp, otpHash);
    if (isValid) {
      // Delete OTP entry after successful verification
      await Otp.deleteMany({ email });

      return sendGeneralResponse(res, true, "OTP verified successfully", 200);
    } else {
      return sendGeneralResponse(res, false, "Invalid OTP", 400);
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return sendGeneralResponse(res, false, "Internal server error", 500);
  }
};

// verify phone no otp signature

const verifyPhoneOtp = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone) {
    return sendGeneralResponse(res, false, "phone is required", 400);
  }

  if (!otp) {
    return sendGeneralResponse(res, false, "OTP is required", 400);
  }

  if (!validatePhone(phone)) {
    return sendGeneralResponse(res, false, "Invalid phone", 400);
  }

  try {
    const otpEntry = await Otp.findOne({ phone });

    if (!otpEntry) {
      return { status: false, message: "Please request a new OTP" };
    }
    const { otpHash, expiresAt } = otpEntry;

    if (Date.now() > expiresAt) {
      return sendGeneralResponse(
        res,
        false,
        "The OTP has expired. Please request a new one.",
        400
      );
    }

    const isValid = await bcrypt.compare(otp, otpHash);

    if (isValid) {
      await Otp.deleteMany({ phone });

      return sendGeneralResponse(res, true, "OTP verified successfully", 200);
    } else {
      return sendGeneralResponse(res, false, "Invalid OTP", 400);
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    sendGeneralResponse(res, false, "Internal server error", 500);
  }
};



const verifyOtpAndChangePassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Check if email, OTP, and new password are provided
  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Email, OTP, and new password are required",
    });
  }

  // Validate email format
  if (!validateEmail(email)) {
    return res.status(400).json({ success: false, message: "Invalid email" });
  }

  try {
    // Find OTP entry in the database
    const otpEntry = await Otp.findOne({ email });

    // Check if OTP entry exists
    if (!otpEntry) {
        return sendGeneralResponse(res, false, "Please request a new OTP", 400);
      }

    const { otpHash, expiresAt } = otpEntry;

     

    // Check if OTP has expired
    if (Date.now() > expiresAt) {
      // Clean up expired OTP
      await Otp.deleteMany({ email });
      return sendGeneralResponse(
        res,
        false,
        "The OTP has expired. Please request a new one.",
        400
      );
    }

    // Verify the OTP
    const isValid = await bcrypt.compare(otp, otpHash);
    if (!isValid) {
 
        return sendGeneralResponse(res, false, "Invalid OTP. Please try again.", 400);

    }

    // Find the user by email
    const user = await User.Artist.findOne({ email });
    if (!user) {
      return sendGeneralResponse(res, false, "User not found", 404);
    }
 
   const Password = await bcrypt.hash(newPassword, 10);
    await User.Artist.updateOne({ email }, { $set: { password: Password } });
 
    await Otp.deleteMany({ email });

    // Email subject and HTML content
    const subject = "Your Password Has Been Successfully Changed";
    const text = ``;
    const html = `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
                <div style="background-color: white; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #FFB6C1; padding: 10px; color: white; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1>Password Change Confirmation</h1>
                    </div>
                    <div style="padding: 20px;">
                        <h2 style="color: #333;">Hello, ${user.username}!</h2>
                        <p>Your password has been successfully changed. If you did not make this change, please contact our support team immediately.</p>
                        <p>We recommend logging in and checking your account to ensure everything is as expected.</p>
                        <p style="margin-top: 20px;">Follow us on social media:</p>
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

    // Send the confirmation email
    await sendMail({
      to: email,
      subject: subject,
      text: text,
      html: html
    });

    // Send success response


      sendGeneralResponse(res, true, "Password changed successfully", 200);

     
  } catch (error) {
    console.error("Error changing password:", error);
    sendGeneralResponse(res, false, "Internal server error", 500);

   }
};

async function findUserByEmail(email) {
  let user = await User.Customer.findOne({ email });
  if (user) return { user, type: "customer" };

  user = await User.Artist.findOne({ email });
  if (user) return { user, type: "artist" };

  return null;
}

module.exports = {
  sendEmailOtp,
  sendPhoneOtp,
  verifyEmailOtp,
  verifyPhoneOtp,
  verifyOtpAndChangePassword,
};
