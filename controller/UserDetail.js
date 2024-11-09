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
const { User, Service } = require("../models/userModel");

const userDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate that an ID was provided
    if (!id) {
      return sendGeneralResponse(res, false, "User ID is required", 400);
    }

    // Artist model के बजाय Service model का उपयोग
    const user = await User.findById(id);

    // Handle case where the user is not found
    if (!user) {
      return sendGeneralResponse(res, false, "User not found", 404);
    }

    const services = await Service.findOne({ userId: id })
      .populate("userId") // यदि user details भी चाहिए
      .select("services"); // केवल services array प्राप्त करें

    const userWithDetails = {
      ...user._doc,
      services: services ? services.services : [], // services object से services array निकालें
    };

    return sendGeneralResponse(
      res,
      true,
      "User details retrieved successfully",
      200,
      userWithDetails
    );
  } catch (error) {
    console.error("Error fetching user details:", error);
    return sendGeneralResponse(res, false, "Internal server error", 500);
  }
};
const getServiceById = async (serviceId) => {
  try {
    const service = await Service.findById(serviceId);
    return service;
  } catch (error) {
    console.error("Error fetching service:", error);
    throw error;
  }
};

module.exports = { userDetail };
