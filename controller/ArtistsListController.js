


const { sendGeneralResponse } = require("../utils/responseHelper");
const User = require('../models/userModel');

const artistList = async (req, res) => {
    try {
        console.log("api is fetching");
        
        // Fetch users with role 'artist'
         const artists = await User.find({ role: 'artist' }).select('username email role _id address phone profile_img');

        // Handle case when no artists are found
        if (!artists || artists.length === 0) {
            return sendGeneralResponse(res, false, 'No artists found', 404);
        }
        return sendGeneralResponse(res, true, 'Artists retrieved successfully', 200, artists);

    } catch (error) {
        console.error('Error fetching artists:', error);
        return sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};

module.exports = { artistList };
