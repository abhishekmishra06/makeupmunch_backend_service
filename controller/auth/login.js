const User = require("../../models/userModel");
const bcrypt = require('bcrypt');

const { sendGeneralResponse } = require("../../utils/responseHelper");
const { generateAccessToken, generateRefreshToken } = require("../../utils/jwt_token");

const login = async (req, res) => {
    const { email, password, fcmToken, role } = req.body;

    if (!email) {
        return sendGeneralResponse(res, false, "Email field is required", 400);
    }

    if (!password) {
        return sendGeneralResponse(res, false, "Password field is required", 400);
    }

    if (!role || !['customer', 'artist'].includes(role)) {
        return sendGeneralResponse(res, false, "Invalid or missing role", 400);
    }

    try {
        let user;
        let isArtist = role === 'artist';


        if (isArtist) {
            user = await User.Artist.findOne({ email, role: "artist" });
        } else {
            user = await User.User.findOne({ email, role: "customer" });
        }


        /// these line give response if user is registered as customer or artist
        // If user is not found in the specified role, check if they exist in the other role
        // Uncomment this block if you want to allow users to switch roles

        //  if (!user) {
        //             const userInOtherRole = isArtist
        //                 ? await User.User.findOne({ email })
        //                 : await Artist.findOne({ email });

        //             if (userInOtherRole) {
        //                 return sendGeneralResponse(
        //                     res,
        //                     false,
        //                     `This email is registered as a ${isArtist ? 'customer' : 'artist'}. Please select the correct role.`,
        //                     400
        //                 );
        //             }

        //             return sendGeneralResponse(res, false, "User not registered", 400);
        //         }


        if (!user) {
            return sendGeneralResponse(res, false, 'User not registered', 400);
        }

        const isMatch = await bcrypt.compare(password, user.password);


        if (!isMatch) {
            return sendGeneralResponse(res, false, 'Invalid password', 400);
        }

        // If artist, check status
        if (isArtist && user.Status !== 'approved') {
            return sendGeneralResponse(res, false, 'Your account is not verified. Please contact support.', 403);
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);


        const updateData = {
            refreshToken,
            isLogin: true,
            lastLoginAt: new Date(),
        };

        if (fcmToken) {
            updateData.fcmToken = fcmToken;
        }

        if (isArtist) {
            await User.Artist.updateOne({ _id: user._id }, { $set: updateData });
        } else {
            await User.User.updateOne({ _id: user._id }, { $set: updateData });
        }


        return sendGeneralResponse(res, true, 'Login successful', 200, { ...user._doc, accessToken, refreshToken });



    } catch (error) {
        console.error('Login error:', error);
        return sendGeneralResponse(res, false, "Internal server error", 500);
    }
};



module.exports = { login }





// if (isMatch) {
//     const accessToken = generateAccessToken(user._id);
//     const refreshToken = generateRefreshToken(user._id);

//     // user.refreshToken = refreshToken;

//     const updateData = {
//         refreshToken,
//         isLogin: true,
//         lastLoginAt: new Date(),
//     };

//     if (fcmToken) {
//         updateData.fcmToken = fcmToken;

//     }

//     await User.User.updateOne({ _id: user._id }, { $set: updateData });

//     return sendGeneralResponse(res, true, 'Login successful', 200, { ...user._doc, accessToken, refreshToken });
// } else {
//     return sendGeneralResponse(res, false, 'Invalid password', 400);
// }