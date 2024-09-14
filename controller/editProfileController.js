const User = require('../models/userModel');  
const { sendGeneralResponse } = require('../utils/responseHelper');  
const { uploadImage } = require('../utils/uploadImages'); 
const { validateEmail, validatePhone } = require('../utils/validation'); 

const editProfile = async (req, res) => {
    const userId = req.params.id;

    if (!req.body && !req.file) {
        return sendGeneralResponse(res, false, 'No data provided', 400);
    }

    const { username, email, dob, address, phone, gender } = req.body;

    if (!username && !email && !dob && !address && !phone && !gender && !req.file) {
        return sendGeneralResponse(res, false, 'No fields to update', 400);
    }

    if (email && !validateEmail(email)) {
        return sendGeneralResponse(res, false, 'Invalid email', 400);
    }
 
    if (phone && !validatePhone(phone)) {
        return sendGeneralResponse(res, false, 'Invalid phone number', 400);
    }

    // Construct update object
    const updateFields = {};
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (dob) updateFields.dob = dob;
    if (address) updateFields.address = address;
    if (phone) updateFields.phone = phone;
    if (gender) updateFields.gender = gender;
    
    // Handle profile image update 
    if (req.file) {
        const profile_img_url = await uploadImage(req.file.buffer, 'profile_img_' + Date.now());
        updateFields.profile_img = profile_img_url;
    } 

    try {
        const user = await User.findByIdAndUpdate(userId, updateFields, { new: true, runValidators: true });
        if (!user) {
            return sendGeneralResponse(res, false, 'User not found', 404);
        }

        sendGeneralResponse(res, true, 'Profile updated successfully', 200, user);
    } catch (error) {
        console.error('Edit profile error:', error);
        sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};

module.exports = { editProfile };






