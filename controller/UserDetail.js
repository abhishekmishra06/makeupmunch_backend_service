const { sendGeneralResponse } = require("../utils/responseHelper");
const User = require('../models/userModel');

const userDetail = async (req, res) => {
    try {
        const { id } = req.params; 

        // Validate that an ID was provided
        if (!id) {
            return sendGeneralResponse(res, false, 'User ID is required', 400);
        }

        // Find the user by ID
        const user = await User.findById(id);

        // Handle case where the user is not found
        if (!user) {
            return sendGeneralResponse(res, false, 'User not found', 404);
        }

       
        return sendGeneralResponse(res, true, 'User details retrieved successfully', 200, user);

    } catch (error) {
        console.error('Error fetching user details:', error);
        return sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};

module.exports = { userDetail };
