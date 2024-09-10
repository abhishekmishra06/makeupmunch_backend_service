const bcrypt = require('bcrypt');  
const jwt = require('jsonwebtoken');   
const { sendGeneralResponse } = require('../utils/responseHelper');

// User Login

const login = async (req, res) => {
    const { phone, password } = req.body;

    if (!phone) {
        return sendGeneralResponse(res, false, "Phone number field is required", 400);
    }

    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
        return sendGeneralResponse(res, false, "Invalid phone number", 400);
    }

    if (!password) {
        return sendGeneralResponse(res, false, "Password field is required", 400);
    }

    try {
        const user = await User.findOne({ phone });

        if (!user) {
            return sendGeneralResponse(res, false, 'User not registered', 400);
        }

        // Compare provided password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
            user.token = token;
            await user.save();
            return sendGeneralResponse(res, true, 'Login successful', 200, user);
        } else {
            return sendGeneralResponse(res, false, 'Invalid password', 400);
        }
    } catch (error) {
        console.error('Login error:', error);
        return  sendGeneralResponse(res, false, "Internal server error", 500);
    }
};








// register user

const register = async (req, res) => {
    const { firstName, lastName, email, phone, DOB, gender, address, profile_img, device_token, password } = req.body;

    const requiredFields = { firstName, lastName, email, phone, DOB, gender, address, profile_img, device_token, password };

    const validationResult = validateRequiredFields(res, requiredFields);
    if (validationResult !== true) return;

    if (!validateEmail(email)) {
        return sendGeneralResponse(res, false, 'Invalid email', 400);
    }

    if (!validatePhoneNumber(phone)) {
        return sendGeneralResponse(res, false, 'Invalid phone number', 400);
    }

    try {
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            let message = '';
            if (existingUser.email === email) message += 'Email already registered. ';
            if (existingUser.phone === phone) message += 'Phone number already registered.';
            return sendGeneralResponse(res, false, message.trim(), 400);
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ 
            firstName, 
            lastName, 
            email, 
            phone, 
            DOB, 
            gender, 
            address, 
            profile_img, 
            device_token,
            password: hashedPassword  
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        user.token = token;
        await user.save();

        sendGeneralResponse(res, true, 'Registered successfully', 200, user);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return sendGeneralResponse(res, false, messages.join('. '), 400);
        }
        console.error('Registration error:', error);
        sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};


module.exports = {login ,register}