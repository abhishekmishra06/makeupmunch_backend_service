// const { sendGeneralResponse } = require("../utils/responseHelper");
// const User = require('../models/userModel');

// const userDetail = async (req, res) => {
//     try {
//         const { id } = req.params; 

//         // Validate that an ID was provided
//         if (!id) {
//             return sendGeneralResponse(res, false, 'User ID is required', 400);
//         }

//         // Find the user by ID
//         const user = await User.Artist.findById(id);

//         // Handle case where the user is not found
//         if (!user) {
//             return sendGeneralResponse(res, false, 'User not found', 404);
//         }

       
//         return sendGeneralResponse(res, true, 'User details retrieved successfully', 200, user);

//     } catch (error) {
//         console.error('Error fetching user details:', error);
//         return sendGeneralResponse(res, false, 'Internal server error', 500);
//     }
// };

// // module.exports = { userDetail };






const { sendGeneralResponse } = require("../utils/responseHelper");
const User = require('../models/userModel');
const Service = require('../models/serviceModel'); // Assuming you have a Service model to fetch services
 
const userDetail = async (req, res) => {
    try {
        const { id } = req.params; 

        // Validate that an ID was provided
        if (!id) {
            return sendGeneralResponse(res, false, 'User ID is required', 400);
        }

        // Find the user by ID
        const user = await User.Artist.findById(id);

        // Handle case where the user is not found
        if (!user) {
            return sendGeneralResponse(res, false, 'User not found', 404);
        }

        // Fetch services associated with the user
        const services = await Service.findById({ userId: id });

        // Fetch favorite status for the user (if any)
        

        // Construct the response
        const userWithDetails = {
            ...user._doc,
             services: services ? services.services : []
        };

        return sendGeneralResponse(res, true, 'User details retrieved successfully', 200, userWithDetails);

    } catch (error) {
        console.error('Error fetching user details:', error);
        return sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};

module.exports = { userDetail };
