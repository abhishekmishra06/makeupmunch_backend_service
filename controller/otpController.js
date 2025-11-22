const { sendMail } = require("../utils/mailer");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const crypto = require("crypto");
const { sendSMS } = require("../utils/sms");
const { sendGeneralResponse } = require("../utils/responseHelper");
const { validateEmail, validatePhone } = require("../utils/validation");
const Otp = require("../models/otp_model");
const { generateEmailVerificationTemplate } = require("../emailTemplate/emailVerification");

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
    const expiresAt = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes

    // Delete any existing OTP entries for the email
    await Otp.deleteMany({ email });

    // Upsert OTP entry in the database
    await Otp.findOneAndUpdate(
      { email },
      { otpHash, expiresAt },
      { upsert: true, new: true }
    );

    // Find user name if exists
    let userName = 'Valued Customer';
    try {
      const existingUser = await User.Customer.findOne({ email });
      if (existingUser && existingUser.username) {
        userName = existingUser.username;
      } else if (existingUser && existingUser.email) {
        userName = existingUser.email.split('@')[0];
      }
    } catch (userError) {
      console.log("User lookup failed, using default name");
    }

    // Email subject and HTML content using new template
    const subject = "Verify Your Email - Makeup Munch";
    const html = generateEmailVerificationTemplate(otp, userName);

    // Send the email
    await sendMail({
      to: email,
      subject: subject,
      text: `Your Makeup Munch verification code is: ${otp}. This code expires in 5 minutes.`,
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

    await sendSMS(phone, otp);
    console.log(otp);
    sendGeneralResponse(res, true, "OTP sent to phone no", 200,);
  } catch (error) {
    console.error("Error sending OTP:", error.message || error);
    sendGeneralResponse(res, false, "Internal server error", 500);
  }
};

// user both for send login otp and forget otp 
const sendUserLoginOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return sendGeneralResponse(res, false, "Phone number is required", 400);
  }

  if (!validatePhone(phone)) {
    return sendGeneralResponse(res, false, "Invalid phone number", 400);
  }

  try {
    // Check if user exists with this phone number
    const existingUser = await User.Customer.findOne({ phone });
    if (!existingUser) {
      return sendGeneralResponse(res, false, "Phone number is not registered", 404);
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = Date.now() + 15 * 60 * 1000;

    // Remove any existing OTPs for this number
    await Otp.deleteMany({ phone });

    // Store new OTP
    const otpEntry = await Otp.findOneAndUpdate(
      { phone },
      { otpHash, expiresAt, email: null },
      { upsert: true, new: true }
    );

    // Send OTP via SMS
    await sendSMS(phone, otp);
    console.log("OTP:", otp);

    sendGeneralResponse(res, true, "OTP sent to phone no", 200);
  } catch (error) {
    console.error("Error sending OTP:", error.message || error);
    sendGeneralResponse(res, false, "Internal server error", 500);
  }
};

const sendUserSignupOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return sendGeneralResponse(res, false, "Phone number is required", 400);
  }

  if (!validatePhone(phone)) {
    return sendGeneralResponse(res, false, "Invalid phone number", 400);
  }

  try {
    // Check if user already exists with this phone number
    const existingUser = await User.Customer.findOne({ phone });

    if (existingUser) {
      return sendGeneralResponse(res, false, "Phone number is already registered", 409);
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = Date.now() + 15 * 60 * 1000;

    // Remove any existing OTPs for this number
    await Otp.deleteMany({ phone });

    // Store new OTP
    const otpEntry = await Otp.findOneAndUpdate(
      { phone },
      { otpHash, expiresAt, email: null },
      { upsert: true, new: true }
    );

    // Send OTP via SMS
    await sendSMS(phone, otp);
    console.log("Signup OTP:", otp);

    sendGeneralResponse(res, true, "OTP sent to phone number for signup", 200);
  } catch (error) {
    console.error("Error sending signup OTP:", error.message || error);
    sendGeneralResponse(res, false, "Internal server error", 500);
  }
};

// user both for send login otp and forget otp 

const sendArtistLoginOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return sendGeneralResponse(res, false, "Phone number is required", 400);
  }

  if (!validatePhone(phone)) {
    return sendGeneralResponse(res, false, "Invalid phone number", 400);
  }

  try {
    // Check if user exists with this phone number
    const existingUser = await User.Artist.findOne({ phone });

    if (!existingUser) {
      return sendGeneralResponse(res, false, "Phone number is not registered", 404);
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = Date.now() + 15 * 60 * 1000;

    // Remove any existing OTPs for this number
    await Otp.deleteMany({ phone });

    // Store new OTP
    const otpEntry = await Otp.findOneAndUpdate(
      { phone },
      { otpHash, expiresAt, email: null },
      { upsert: true, new: true }
    );

    // Send OTP via SMS
    await sendSMS(phone, otp);
    console.log("OTP:", otp);

    sendGeneralResponse(res, true, "OTP sent to phone no", 200);
  } catch (error) {
    console.error("Error sending OTP:", error.message || error);
    sendGeneralResponse(res, false, "Internal server error", 500);
  }
};

const sendArtistSignupOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return sendGeneralResponse(res, false, "Phone number is required", 400);
  }

  if (!validatePhone(phone)) {
    return sendGeneralResponse(res, false, "Invalid phone number", 400);
  }

  try {
    // Check if user already exists with this phone number
    const existingUser = await User.Artist.findOne({ phone });

    if (existingUser) {
      return sendGeneralResponse(res, false, "Phone number is already registered", 409);
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = Date.now() + 15 * 60 * 1000;

    // Remove any existing OTPs for this number
    await Otp.deleteMany({ phone });

    // Store new OTP
    const otpEntry = await Otp.findOneAndUpdate(
      { phone },
      { otpHash, expiresAt, email: null },
      { upsert: true, new: true }
    );

    // Send OTP via SMS
    await sendSMS(phone, otp);
    console.log("Signup OTP:", otp);

    sendGeneralResponse(res, true, "OTP sent to phone number for signup", 200);
  } catch (error) {
    console.error("Error sending signup OTP:", error.message || error);
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

const verifyPhoneOtpHelper = async (phone, otp) => {
  if (!phone) {
    return { status: false, message: "phone is required", code: 400 };
  }

  if (!otp) {
    return { status: false, message: "OTP is required", code: 400 };
  }

  if (!validatePhone(phone)) {
    return { status: false, message: "Invalid phone", code: 400 };
  }

  try {
    const otpEntry = await Otp.findOne({ phone });

    if (!otpEntry) {
      return { status: false, message: "Please request a new OTP", code: 400 };
    }

    const { otpHash, expiresAt } = otpEntry;

    if (Date.now() > expiresAt) {
      return {
        status: false,
        message: "The OTP has expired. Please request a new one.",
        code: 400,
      };
    }

    const isValid = await bcrypt.compare(otp, otpHash);

    if (!isValid) {
      return { status: false, message: "Invalid OTP", code: 400 };
    }

    // Success - delete OTP entry
    await Otp.deleteMany({ phone });

    return { status: true, message: "OTP verified successfully", code: 200 };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { status: false, message: "Internal server error", code: 500 };
  }
};

const verifyEmaiOtpHelper = async (email, otp) => {
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
      return { status: false, message: "Please request a new OTP", code: 400 };
    }

    const { otpHash, expiresAt } = otpEntry;

    // Log current time and expiration time for debugging
    console.log("Current Time:", Date.now());
    console.log("OTP Expiration Time:", expiresAt);

    // Check if OTP has expired
    if (Date.now() > expiresAt) {
      // Clean up expired OTP
      await Otp.deleteMany({ email });

      return { status: false, message: "The OTP has expired. Please request a new one", code: 400 };
    }

    // Compare provided OTP with stored OTP hash
    const isValid = await bcrypt.compare(otp, otpHash);
    if (isValid) {
      // Delete OTP entry after successful verification
      await Otp.deleteMany({ email });

      return { status: true, message: "OTP verified successfully", code: 200 };
    } else {
      return { status: false, message: "Invalid OTP", code: 400 };
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { status: false, message: "Internal server error", code: 500 };
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
    const user = await User.Customer.findOne({ email });
    if (!user) {
      return sendGeneralResponse(res, false, "User not found", 404);
    }

    const Password = await bcrypt.hash(newPassword, 10);
    await User.Customer.updateOne({ email }, { $set: { password: Password } });

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
                            <a href="https://www.facebook.com/profile.php?id=61576604952593" style="margin-right: 10px;">
                                <img src="https://img.icons8.com/ios-filled/24/FF69B4/facebook-new.png" alt="Facebook" />
                            </a>
                            <a href="https://www.instagram.com/makeupmunch_official" style="margin-right: 10px;">
                                <img src="https://img.icons8.com/ios-filled/24/FF69B4/instagram-new.png" alt="Instagram" />
                            </a>
                            <a href="mailto:support@yourservice.com">
                                <img src="https://img.icons8.com/ios-filled/24/FF69B4/support.png" alt="Support" />
                            </a>
                        </div>
                    </div>
                    <div style="margin-top: 20px; text-align: center; color: #777; font-size: 12px;">
                        <p>&copy; 2025 Our Service. All Rights Reserved.</p>
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

const verifyOtpAndChangeArtistPassword = async (req, res) => {
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
                            <a href="https://www.facebook.com/profile.php?id=61576604952593" style="margin-right: 10px;">
                                <img src="https://img.icons8.com/ios-filled/24/FF69B4/facebook-new.png" alt="Facebook" />
                            </a>
                            <a href="https://www.instagram.com/makeupmunch_official" style="margin-right: 10px;">
                                <img src="https://img.icons8.com/ios-filled/24/FF69B4/instagram-new.png" alt="Instagram" />
                            </a>
                            <a href="mailto:support@yourservice.com">
                                <img src="https://img.icons8.com/ios-filled/24/FF69B4/support.png" alt="Support" />
                            </a>
                        </div>
                    </div>
                    <div style="margin-top: 20px; text-align: center; color: #777; font-size: 12px;">
                        <p>&copy; 2025 Our Service. All Rights Reserved.</p>
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
  sendUserLoginOtp,
  sendArtistLoginOtp,
  verifyEmailOtp,
  verifyPhoneOtp,
  verifyOtpAndChangePassword,
  verifyOtpAndChangeArtistPassword,
  verifyPhoneOtpHelper,
  verifyEmaiOtpHelper,
  sendArtistSignupOtp,
  sendUserSignupOtp
};
