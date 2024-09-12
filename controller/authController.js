const multer = require('multer');
const { uploadImage } = require('../utils/uploadImages');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendGeneralResponse } = require('../utils/responseHelper');
const { validateEmail, validatePhone } = require('../utils/validation');
const User = require('../models/userModel');
const upload = multer({ storage: multer.memoryStorage() });



// User Login

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return sendGeneralResponse(res, false, "Email field is required", 400);
    }

    if (!password) {
        return sendGeneralResponse(res, false, "Password field is required", 400);
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return sendGeneralResponse(res, false, 'User not registered', 400);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
            user.token = token;
            await user.save();
            return sendGeneralResponse(res, true, 'Login successful', 200, { ...user._doc, token });
        } else {
            return sendGeneralResponse(res, false, 'Invalid password', 400);
        }
    } catch (error) {
        console.error('Login error:', error);
        return sendGeneralResponse(res, false, "Internal server error", 500);
    }
};



 



const register = async (req, res) => {
     if (!req.body) {
        return sendGeneralResponse(res, false, 'Request body is missing', 400);
    }

    const { username, email, password, dob, address, phone, gender ,   } = req.body;

    

    if (!username) {
        return sendGeneralResponse(res, false, 'Username is required', 400);
    }
    if (!email) {
        return sendGeneralResponse(res, false, 'Email is required', 400);
    }
    if (!password) {
        return sendGeneralResponse(res, false, 'Password is required', 400);
    }
    if (!dob) {
        return sendGeneralResponse(res, false, 'Date of birth is required', 400);
    }
    if (!address) {
        return sendGeneralResponse(res, false, 'Address is required', 400);
    }
    if (!phone) {
        return sendGeneralResponse(res, false, 'Phone number is required', 400);
    }
    if (!gender) {
        return sendGeneralResponse(res, false, 'Gender is required', 400);
    }
    if (!req.file) {
        return sendGeneralResponse(res, false, 'Profile image is required', 400);
    }


     
    if (!validateEmail(email)) {
        return sendGeneralResponse(res, false, 'Invalid email', 400);
    }
    if (!validatePhone(phone)) {
        return sendGeneralResponse(res, false, 'Invalid phone', 400);
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendGeneralResponse(res, false, 'Email already registered', 400);
        }
 
        let profile_img_url = null;

        if (req.file) {
            profile_img_url = await uploadImage(req.file.buffer, 'profile_img_' + Date.now());
        }

         const hashedPassword = await bcrypt.hash(password, 10);

         const user = new User({
            username,
            email,
            password: hashedPassword,
            dob,
            address,
            phone,
            gender,
            profile_img: profile_img_url 
        });

       
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        user.token = token;
 
        await user.save();

        
        sendGeneralResponse(res, true, 'Registered successfully', 200, { ...user._doc, token });
    } catch (error) {
        console.error('Registration error:', error);
        sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};



module.exports = { login, register }