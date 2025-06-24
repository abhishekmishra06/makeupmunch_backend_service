const { sendMail } = require("../utils/mailer");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const crypto = require("crypto");
const { sendGeneralResponse } = require("../utils/responseHelper");
const { validateEmail } = require("../utils/validation");
const Otp = require("../models/otp_model");
const { generateEmailVerificationTemplate } = require("../emailTemplate/emailVerification");

// Send email verification OTP
const sendEmailVerification = async (req, res) => {
  console.log("Email verification OTP request");
  const { email, userId } = req.body;

  // Check if email is provided
  if (!email) {
    return sendGeneralResponse(res, false, "Email is required", 400);
  }

  // Validate email format
  if (!validateEmail(email)) {
    return sendGeneralResponse(res, false, "Invalid email format", 400);
  }

  try {
    // Check if user exists
    let user = null;
    let userName = 'Valued Customer';
    
    if (userId) {
      user = await User.Customer.findById(userId);
      if (user && user.username) {
        userName = user.username;
      } else if (user && user.email) {
        userName = user.email.split('@')[0];
      }
    } else {
      // Try to find user by email
      user = await User.Customer.findOne({ email });
      if (user && user.username) {
        userName = user.username;
      } else if (email) {
        userName = email.split('@')[0];
      }
    }

    // Generate OTP and hash it
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes

    // Delete any existing OTP entries for the email
    await Otp.deleteMany({ email });

    // Store new OTP entry in the database
    await Otp.findOneAndUpdate(
      { email },
      { otpHash, expiresAt },
      { upsert: true, new: true }
    );

    // Generate email content using template
    const subject = "Verify Your Email - Makeup Munch";
    const html = generateEmailVerificationTemplate(otp, userName);

    // Send the email
    await sendMail({
      to: email,
      subject: subject,
      text: `Your Makeup Munch verification code is: ${otp}. This code expires in 5 minutes.`,
      html: html
    });

    console.log(`Email verification OTP sent to ${email}: ${otp}`);

    // Send success response
    sendGeneralResponse(res, true, "Verification email sent successfully", 200, {
      message: "Please check your email for the verification code",
      expiresIn: 300 // 5 minutes in seconds
    });

  } catch (error) {
    console.error("Error sending email verification:", error);
    sendGeneralResponse(res, false, "Failed to send verification email", 500);
  }
};

// Verify email OTP
const verifyEmailOtp = async (req, res) => {
  const { email, otp, userId } = req.body;

  // Validate required fields
  if (!email) {
    return sendGeneralResponse(res, false, "Email is required", 400);
  }

  if (!otp) {
    return sendGeneralResponse(res, false, "Verification code is required", 400);
  }

  // Validate email format
  if (!validateEmail(email)) {
    return sendGeneralResponse(res, false, "Invalid email format", 400);
  }

  // Validate OTP format
  if (!/^\d{6}$/.test(otp)) {
    return sendGeneralResponse(res, false, "Verification code must be 6 digits", 400);
  }

  try {
    // Find OTP entry in the database
    const otpEntry = await Otp.findOne({ email });

    if (!otpEntry) {
      return sendGeneralResponse(res, false, "No verification code found. Please request a new one.", 400);
    }

    const { otpHash, expiresAt } = otpEntry;

    // Check if OTP has expired
    if (Date.now() > expiresAt) {
      // Clean up expired OTP
      await Otp.deleteMany({ email });
      return sendGeneralResponse(res, false, "Verification code has expired. Please request a new one.", 400);
    }

    // Compare provided OTP with stored OTP hash
    const isValid = await bcrypt.compare(otp, otpHash);
    
    if (!isValid) {
      return sendGeneralResponse(res, false, "Invalid verification code. Please try again.", 400);
    }

    // OTP is valid - mark email as verified
    if (userId) {
      // Update user's email verification status
      await User.Customer.findByIdAndUpdate(userId, { 
        email_verify: true,
        email: email
      });
    } else {
      // Find user by email and mark as verified
      await User.Customer.findOneAndUpdate(
        { email }, 
        { email_verify: true }
      );
    }

    // Delete OTP entry after successful verification
    await Otp.deleteMany({ email });

    console.log(`Email verified successfully for ${email}`);

    return sendGeneralResponse(res, true, "Email verified successfully", 200, {
      emailVerified: true,
      message: "Your email has been verified successfully!"
    });

  } catch (error) {
    console.error("Error verifying email OTP:", error);
    return sendGeneralResponse(res, false, "Verification failed. Please try again.", 500);
  }
};

// Resend email verification OTP
const resendEmailVerification = async (req, res) => {
  console.log("Resend email verification OTP request");
  
  // Use the same logic as sendEmailVerification
  return await sendEmailVerification(req, res);
};

// Check email verification status
const checkEmailVerificationStatus = async (req, res) => {
  const { email, userId } = req.query;

  if (!email && !userId) {
    return sendGeneralResponse(res, false, "Email or User ID is required", 400);
  }

  try {
    let user;
    
    if (userId) {
      user = await User.Customer.findById(userId);
    } else {
      user = await User.Customer.findOne({ email });
    }

    if (!user) {
      return sendGeneralResponse(res, false, "User not found", 404);
    }

    const isVerified = user.email_verify === true;

    return sendGeneralResponse(res, true, "Email verification status retrieved", 200, {
      email: user.email,
      isVerified: isVerified,
      verificationStatus: isVerified ? 'verified' : 'pending'
    });

  } catch (error) {
    console.error("Error checking email verification status:", error);
    return sendGeneralResponse(res, false, "Failed to check verification status", 500);
  }
};

module.exports = {
  sendEmailVerification,
  verifyEmailOtp,
  resendEmailVerification,
  checkEmailVerificationStatus
}; 