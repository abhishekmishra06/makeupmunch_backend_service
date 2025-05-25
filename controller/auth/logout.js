const User = require("../../models/userModel");

const { sendGeneralResponse } = require("../../utils/responseHelper");

const logout = async (req, res) => {
    const userId = req.userId; // Assuming `userId` is extracted from middleware

    try {
        const user = await User.findById(userId);

        if (!user) {
            return sendGeneralResponse(res, false, "User not found", 404);
        }

        await User.updateOne({ _id: userId }, {
            $set: {
                isActive: false,
                lastActiveAt: new Date(),
                fcmToken: null,
                refreshToken: null
            }
        });

        return sendGeneralResponse(res, true, "Logout successful", 200);
    } catch (error) {
        console.error("Logout error:", error);
        return sendGeneralResponse(res, false, "Internal server error", 500);
    }
};

module.exports = {logout };
