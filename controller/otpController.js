const { sendMail } = require("../utils/mailer");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const crypto = require("crypto");
const { sendSMS } = require("../utils/sms");
const { sendGeneralResponse } = require("../utils/responseHelper");
const { validateEmail, validatePhone } = require("../utils/validation");
const Otp = require("../models/otp_model");

const sendEmailOtp = async (req, res) => {
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
    const subject = "Your OTP Code";
    const html = `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
                <div style="background-color: white; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #4CAF50; padding: 10px; color: white; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1>Your OTP Code</h1>
                    </div>
                    <div style="padding: 20px;">
                        <h2 style="color: #333;">Hello!</h2>
                        <p>Your One-Time Password (OTP) is:</p>
                        <h1 style="font-size: 2em; color: #4CAF50;">${otp}</h1>
                        <p>This OTP is valid for the next 15 minutes. Please enter it on the verification page to proceed.</p>
                        <p>If you did not request this OTP, please ignore this email.</p>
                    </div>
                    <div style="margin-top: 20px; text-align: center; color: #777; font-size: 12px;">
                        <p>&copy; 2024 Our Service. All Rights Reserved.</p>
                    </div>
                </div>
            </div>
        `;

    // Send the email
    await sendMail(email, subject, "", html);

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
    const user = await User.User.findOne({ email });
    if (!user) {
      return sendGeneralResponse(res, false, "User not found", 404);
    }
 
   const Password = await bcrypt.hash(newPassword, 10);
    await User.User.updateOne({ email }, { $set: { password: Password } });
 
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
    await sendMail(email, subject, text, html);

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
