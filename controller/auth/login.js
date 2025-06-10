const User = require("../../models/userModel");
const bcrypt = require('bcrypt');

const { sendGeneralResponse } = require("../../utils/responseHelper");
const { generateAccessToken, generateRefreshToken } = require("../../utils/jwt_token");
const Otp = require("../../models/otp_model");
const { verifyPhoneOtpHelper } = require("../otpController");
const { validatePhone, validateEmail } = require("../../utils/validation");

// const login = async (req, res) => {
//     const { email, phone, otp, password, fcmToken, role } = req.body;

//     console.log("Login running for role:", role);
//     console.log("Request data:", { email, phone, otp: otp ? '***' : undefined, role });

//     if (!role || !['customer', 'artist'].includes(role)) {
//         return sendGeneralResponse(res, false, "Invalid or missing role", 400);
//     }

//     try {
//         let user;
//         let isArtist = role === 'artist';
//         const isCustomer = role === 'customer';

//         if (isArtist) {
//             // Artist login with email + password
//             if (!email) {
//                 return sendGeneralResponse(res, false, "Email field is required for artist login", 400);
//             }

//             if (!password) {
//                 return sendGeneralResponse(res, false, "Password is required for artist login", 400);
//             }

//             user = await User.Artist.findOne({ email, role: "artist" });

//             if (!user) {
//                 return sendGeneralResponse(res, false, 'Artist not registered with this email', 400);
//             }

//             const isMatch = await bcrypt.compare(password, user.password);

//             if (!isMatch) {
//                 return sendGeneralResponse(res, false, 'Invalid password', 400);
//             }

//             if (user.Status !== 'approved') {
//                 return sendGeneralResponse(res, false, 'Your account is not verified. Please contact support.', 403);
//             }

//         } else if (isCustomer) {
//             // Customer login with phone + OTP
//             if (!phone) {
//                 return sendGeneralResponse(res, false, "Phone number is required for customer login", 400);
//             }

//             if (!otp) {
//                 return sendGeneralResponse(res, false, "OTP is required for customer login", 400);
//             }

//             // Find customer by phone number (fixed the bug - was using email)
//             user = await User.Customer.findOne({ phone, role: "customer" });

//             if (!user) {
//                 return sendGeneralResponse(res, false, 'No account found with this phone number', 400);
//             }

//             // Verify the phone OTP
//             console.log('Verifying OTP for phone:', phone);
//             const otpResult = await verifyPhoneOtpHelper(phone, otp);
//             console.log('OTP verification result:', otpResult);

//             if (!otpResult.status) {
//                 return sendGeneralResponse(res, false, otpResult.message, otpResult.code);
//             }
//         }

//         // Generate tokens for successful login
//         const accessToken = generateAccessToken(user._id);
//         const refreshToken = generateRefreshToken(user._id);

//         // Update user login information
//         const updateData = {
//             refreshToken,
//             isLogin: true,
//             lastLoginAt: new Date(),
//         };

//         if (fcmToken) {
//             updateData.fcmToken = fcmToken;
//         }

//         // Update the appropriate user collection
//         if (isArtist) {
//             await User.Artist.updateOne({ _id: user._id }, { $set: updateData });
//         } else {
//             await User.Customer.updateOne({ _id: user._id }, { $set: updateData });
//         }

//         console.log('Login successful for user:', user._id);
//         return sendGeneralResponse(res, true, 'Login successful', 200, {
//             ...user._doc,
//             accessToken,
//             refreshToken
//         });

//     } catch (error) {
//         console.error('Login error:', error);
//         return sendGeneralResponse(res, false, "Internal server error", 500);
//     }
// };




const customerLogin = async (req, res) => {
    const { phone, otp, fcmToken } = req.body;

    if (!phone) {
        return sendGeneralResponse(res, false, "Phone number is required for customer login", 400);
    }

    if (!otp) {
        return sendGeneralResponse(res, false, "OTP is required for customer login", 400);
    }


    if (!validatePhone(phone)) {
        return sendGeneralResponse(res, false, "Invalid phone number format", 400)
    }


    try {
        const user = await User.Customer.findOne({ phone, role: "customer" });

        if (!user) {
            return sendGeneralResponse(res, false, "No account found with this phone number", 400);
        }

        const otpResult = await verifyPhoneOtpHelper(phone, otp);

        if (!otpResult.status) {
            return sendGeneralResponse(res, false, otpResult.message, otpResult.code);
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        const updateData = {
            refreshToken,
            isLogin: true,
            lastLoginAt: new Date(),
        };

        if (fcmToken) updateData.fcmToken = fcmToken;

        await User.Customer.updateOne({ _id: user._id }, { $set: updateData });

        return sendGeneralResponse(res, true, "Customer login successful", 200, {
            ...user._doc,
            accessToken,
            refreshToken,
        });

    } catch (error) {
        console.error("Customer login error:", error);
        return sendGeneralResponse(res, false, "Internal server error", 500);
    }
};





const artistLoginWithPassword = async (req, res) => {
    const { emailOrPhone, password, fcmToken } = req.body;

    if (!emailOrPhone) {
        return sendGeneralResponse(res, false, "Email or Phone is required", 400);
    }

    if (!password) {
        return sendGeneralResponse(res, false, "Password is required", 400);
    }

    try {
        let user;

        if (validateEmail(emailOrPhone)) {
            user = await User.Artist.findOne({ email: emailOrPhone, role: "artist" });
        } else if (validatePhone(emailOrPhone)) {
            user = await User.Artist.findOne({ phone: emailOrPhone, role: "artist" });
        } else {
            return sendGeneralResponse(res, false, "Invalid email or phone number format", 400);
        }

        if (!user) {
            return sendGeneralResponse(res, false, "Artist not registered with this email", 400);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return sendGeneralResponse(res, false, "Invalid password", 400);
        }

        // if (user.Status !== "approved") {
        //     return sendGeneralResponse(res, false, "Your account is not verified. Please contact support.", 403);
        // }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        const updateData = {
            refreshToken,
            isLogin: true,
            lastLoginAt: new Date(),
        };

        if (fcmToken) updateData.fcmToken = fcmToken;

        await User.Artist.updateOne({ _id: user._id }, { $set: updateData });

        return sendGeneralResponse(res, true, "Artist login successful", 200, {
            ...user._doc,
            accessToken,
            refreshToken,
        });

    } catch (error) {
        console.error("Artist login error:", error);
        return sendGeneralResponse(res, false, "Internal server error", 500);
    }
};




const  ArtistLoginWithOtp = async (req, res) => {
    const { phone, otp, fcmToken } = req.body;

    console.log("Artist login with OTP - phone:", phone);

    if (!phone) {
        return sendGeneralResponse(res, false, "Phone number is required", 400);
    }

    if (!otp) {
        return sendGeneralResponse(res, false, "OTP is required", 400);
    }

    try {
        // Check if artist exists with the phone number
        const user = await User.Artist.findOne({ phone, role: 'artist' });

        if (!user) {
            return sendGeneralResponse(res, false, "Artist not registered with this phone number", 400);
        }

        // Check OTP validity
        const otpResult = await verifyPhoneOtpHelper(phone, otp);

        if (!otpResult.status) {
            return sendGeneralResponse(res, false, otpResult.message, otpResult.code);
        }

        if (user.Status !== 'approved') {
            return sendGeneralResponse(res, false, 'Your account is not verified. Please contact support.', 403);
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Update login info
        const updateData = {
            refreshToken,
            isLogin: true,
            lastLoginAt: new Date(),
        };

        if (fcmToken) {
            updateData.fcmToken = fcmToken;
        }

        await User.Artist.updateOne({ _id: user._id }, { $set: updateData });

        console.log("Artist OTP login successful:", user._id);

        return sendGeneralResponse(res, true, "Login successful", 200, {
            ...user._doc,
            accessToken,
            refreshToken,
        });

    } catch (error) {
        console.error("Artist OTP login error:", error);
        return sendGeneralResponse(res, false, "Internal server error", 500);
    }
};




module.exports = { ArtistLoginWithOtp, artistLoginWithPassword, customerLogin }