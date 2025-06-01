const User = require("../../models/userModel");
const bcrypt = require('bcrypt');

const { sendGeneralResponse } = require("../../utils/responseHelper");
const { generateAccessToken, generateRefreshToken } = require("../../utils/jwt_token");
const Otp = require("../../models/otp_model");

const login = async (req, res) => {
    const { email, password, fcmToken, role } = req.body;

    console.log("login running")

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
        const isCustomer = role === 'customer';


        if (isArtist) {

            if (!password) {
                return sendGeneralResponse(res, false, "Password is required for artist login", 400);
            }

            user = await User.Artist.findOne({ email, role: "artist" });


            if (!user) {
                return sendGeneralResponse(res, false, 'Artist not registered', 400);
            }




            const isMatch = await bcrypt.compare(password, user.password);


            if (!isMatch) {
                return sendGeneralResponse(res, false, 'Invalid password', 400);
            }



            if (user.Status !== 'approved') {
                return sendGeneralResponse(res, false, 'Your account is not verified. Please contact support.', 403);
            }



        } else if (isCustomer) {

            // for otp login 
            // if (!otp) {
            //     return sendGeneralResponse(res, false, "OTP is required for customer login", 400);
            // }


            // const fixedOTP = '1234'; // replace with real OTP logic if needed

            // if (otp !== fixedOTP) {
            //     return sendGeneralResponse(res, false, 'Invalid OTP', 400);
            // }

            if (!password) {
                return sendGeneralResponse(res, false, "Password is required for artist login", 400);
            }
console.log(password);

            user = await User.Customer.findOne({ email, role: "customer" });

            if (!user) {
                return sendGeneralResponse(res, false, 'Customer not registered', 400);
            }



            const isMatch = await bcrypt.compare(password, user.password);

console.log(isMatch);

            if (!isMatch) {
                return sendGeneralResponse(res, false, 'Invalid password', 400);
            }

        }




        //     const isMatch = await bcrypt.compare(password, user.password);


        // if (!isMatch) {
        //     return sendGeneralResponse(res, false, 'Invalid password', 400);
        // }

        // // If artist, check status
        // if (isArtist && user.Status !== 'approved') {
        //     return sendGeneralResponse(res, false, 'Your account is not verified. Please contact support.', 403);
        // }

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
            await User.Customer.updateOne({ _id: user._id }, { $set: updateData });
        }


        return sendGeneralResponse(res, true, 'Login successful', 200, { ...user._doc, accessToken, refreshToken });



    } catch (error) {
        console.error('Login error:', error);
        return sendGeneralResponse(res, false, "Internal server error", 500);
    }
};



module.exports = { login }








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