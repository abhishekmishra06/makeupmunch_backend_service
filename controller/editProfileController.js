const { User} = require('../models/userModel');  
const { sendGeneralResponse } = require('../utils/responseHelper');  
const { uploadImage } = require('../utils/uploadImages'); 
const { validateEmail, validatePhone } = require('../utils/validation'); 

const editProfile = async (req, res) => {
    try {
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
            try {
                const profile_img_url = await uploadImage(req.file.buffer, 'profile_img_' + Date.now());
                updateFields.profile_img = profile_img_url;
            } catch (uploadError) {
                console.error('Image upload error:', uploadError);
                return sendGeneralResponse(res, false, 'Error uploading image', 500);
            }
        } 

        const user = await User.findByIdAndUpdate(
            userId, 
            updateFields, 
            { new: true, runValidators: true }
        );

        if (!user) {
            return sendGeneralResponse(res, false, 'User not found', 404);
        }

        sendGeneralResponse(res, true, 'Profile updated successfully', 200, user);
    } catch (error) {
        console.error('Edit profile error:', error.message);
        console.error('Stack trace:', error.stack);
        return sendGeneralResponse(res, false, `Error updating profile: ${error.message}`, 500);
    }
};




const editArtistProfile = async (req, res) => {
    const userId = req.params.id;

    if (!req.body && !req.file) {
        return sendGeneralResponse(res, false, 'No data provided', 400);
    }

    const {businessName, username, email,   phone, city, specialties } = req.body;

    // Check if no valid fields are provided
    if (!businessName && !username && !email &&  !phone &&  !city && !specialties && !req.file) {
        return sendGeneralResponse(res, false, 'No fields to update', 400);
    }

    // Validate email if provided
    if (email && !validateEmail(email)) {
        return sendGeneralResponse(res, false, 'Invalid email', 400);
    }

    // Validate phone number if provided
    if (phone && !validatePhone(phone)) {
        return sendGeneralResponse(res, false, 'Invalid phone number', 400);
    }

    // Construct update object for valid fields
    const updateFields = {};
    if (businessName) updateFields.businessName = businessName;
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
     if (phone) updateFields.phone = phone;
    // if (gender) updateFields.gender = gender;
    if (city) updateFields.city = city;
    if (specialties && Array.isArray(specialties) && specialties.length > 0) updateFields.specialties = specialties;

    // Handle profile image update
    if (req.file) {
        try {
            const profile_img_url = await uploadImage(req.file.buffer, 'profile_img_' + Date.now());
            updateFields.profile_img = profile_img_url;
        } catch (error) {
            return sendGeneralResponse(res, false, 'Error uploading image', 500);
        }
    }

    try {
        // Find and update the artist profile
        const user = await User.Artist.findByIdAndUpdate(userId, updateFields, { new: true, runValidators: true });
        


        // If no user is found with the provided userId
        if (!user) {
            return sendGeneralResponse(res, false, 'Artist not found', 404);
        }


        if(user.role !=="artist"
        ){
            return sendGeneralResponse(res, false, 'Ahis is validate only for Artist', 404);

        }

        // Return updated user data
        sendGeneralResponse(res, true, 'Profile updated successfully', 200, {
            _id: user._id,
            businessName: user.businessName,
            username: user.username,
            email: user.email,
            phone: user.phone,
            city: user.city,
            specialties: user.specialties,
              
        });

    } catch (error) {
        console.error('Edit profile error:', error);
        sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};



module.exports = { editProfile , editArtistProfile };






