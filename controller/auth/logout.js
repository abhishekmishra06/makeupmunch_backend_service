const User = require("../../models/userModel");

const { sendGeneralResponse } = require("../../utils/responseHelper");

const userLogout = async (req, res) => {
    const userId = req.user?.id; 

    try {
        const user = await User.Customer.findById(userId);

        if (!user) {
            return sendGeneralResponse(res, false, "User not found", 404);
        }

        await User.Customer.updateOne({ _id: userId }, {
            $set: {
                isLogin: false,
                lastLoginAt: new Date(),
                // fcmToken: null,
                refreshToken: null
            }
        });

        return sendGeneralResponse(res, true, "Logout successful", 200);
    } catch (error) {
        console.error("Logout error:", error);
        return sendGeneralResponse(res, false, "Internal server error", 500);
    }
};


const  artistLogout = async (req, res) => {
  const artistId = req.user?.id;

  if (!artistId) {
    return sendGeneralResponse(res, false, "Unauthorized", 401);
  }

  try {
    const artist = await User.Artist.findById(artistId);

    if (!artist) {
      return sendGeneralResponse(res, false, "Artist not found", 404);
    }

    await User.Artist.updateOne(
      { _id: artistId },
      {
        $set: {
          isLogin: false,
          lastLoginAt: new Date(),
          refreshToken: null,
        },
      }
    );

    return sendGeneralResponse(res, true, "Logout successful", 200);
  } catch (error) {
    console.error("Artist logout error:", error);
    return sendGeneralResponse(res, false, "Internal server error", 500);
  }
};

 
module.exports = {userLogout , artistLogout };
