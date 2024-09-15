
const { sendGeneralResponse } = require("../utils/responseHelper");
const User = require('../models/userModel');

const allUsersList = async (req, res) => {
    try {
        
       
         const users = await User.find().select('username email role _id address phone profile_img');
        
        // Handle case when no artists are found
        if (!users || users.length === 0) {
            return sendGeneralResponse(res, false, 'No user found', 404);
        }
        return sendGeneralResponse(res, true, 'all user retrieved successfully', 200, users);

    } catch (error) {
        console.error('Error fetching artists:', error);
        return sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};
 

 module.exports = {allUsersList}