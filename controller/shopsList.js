
const { sendGeneralResponse } = require("../utils/responseHelper");
const User = require('../models/userModel');

const shopsList = async (req, res) => {
    try {
         
        // Fetch users with role 'artist'
         const shops = await User.find({ role: 'beauty_parlor' }).select('username email role _id address phone profile_img');

        // Handle case when no artists are found
        if (!shops || shops.length === 0) {
            return sendGeneralResponse(res, false, 'No artists found', 404);
        }
        return sendGeneralResponse(res, true, 'shops list retrieved successfully', 200, shops);

    } catch (error) {
        console.error('Error fetching artists:', error);
        return sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};
 

 









 

const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;  
        
         
         if (!role) {
            return sendGeneralResponse(res, false, 'Role is required', 400);
        }

          const users = await User.find({ role }).select('username email role _id address phone profile_img');

         if (!users || users.length === 0) {
            return sendGeneralResponse(res, false, `No users found with role: ${role}`, 404);
        }

         return sendGeneralResponse(res, true, `Users with role: ${role} retrieved successfully`, 200, users);

    } catch (error) {
        console.error('Error fetching users by role:', error);
        return sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};

module.exports = { getUsersByRole , shopsList };
