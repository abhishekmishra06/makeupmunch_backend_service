const User = require("../../models/userModel");
const bcrypt = require('bcrypt');

const { sendGeneralResponse } = require("../../utils/responseHelper");
const { generateAccessToken, generateRefreshToken } = require("../../utils/jwt_token");

const login = async (req, res) => {
    const { email, password, fcmToken } = req.body;

    if (!email) {
        return sendGeneralResponse(res, false, "Email field is required", 400);
    }

    if (!password) {
        return sendGeneralResponse(res, false, "Password field is required", 400);
    }

    try {
        const user = await User.User.findOne({ email });

        if (!user) {
            return sendGeneralResponse(res, false, 'User not registered', 400);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const accessToken = generateAccessToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            // user.refreshToken = refreshToken;

            const updateData = {
                refreshToken,
                isLogin: true,
                lastLoginAt: new Date(),
            };

            if (fcmToken) {
                updateData.fcmToken = fcmToken;

            }




            // await user.save();
            await User.User.updateOne({ _id: user._id }, { $set: updateData });

            return sendGeneralResponse(res, true, 'Login successful', 200, { ...user._doc, accessToken, refreshToken });
        } else {
            return sendGeneralResponse(res, false, 'Invalid password', 400);
        }
    } catch (error) {
        console.error('Login error:', error);
        return sendGeneralResponse(res, false, "Internal server error", 500);
    }
};



module.exports = { login }