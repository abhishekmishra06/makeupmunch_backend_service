const bcrypt = require('bcrypt');  
const jwt = require('jsonwebtoken');   
const { sendGeneralResponse } = require('../utils/responseHelper');
const { validateEmail } = require('../utils/validation');
const User = require('../models/userModel');
// User Login

// const login = async (req, res) => {
//     const { phone, password } = req.body;

//     if (!phone) {
//         return sendGeneralResponse(res, false, "Phone number field is required", 400);
//     }

//     if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
//         return sendGeneralResponse(res, false, "Invalid phone number", 400);
//     }

//     if (!password) {
//         return sendGeneralResponse(res, false, "Password field is required", 400);
//     }

//     try {
//         const user = await User.findOne({ phone });

//         if (!user) {
//             return sendGeneralResponse(res, false, 'User not registered', 400);
//         }

//         // Compare provided password with stored hashed password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (isMatch) {
//             const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
//             user.token = token;
//             await user.save();
//             return sendGeneralResponse(res, true, 'Login successful', 200, user);
//         } else {
//             return sendGeneralResponse(res, false, 'Invalid password', 400);
//         }
//     } catch (error) {
//         console.error('Login error:', error);
//         return  sendGeneralResponse(res, false, "Internal server error", 500);
//     }
// };





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
    // Ensure req.body is defined
    if (!req.body) {
        return sendGeneralResponse(res, false, 'Request body is missing', 400);
    }

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return sendGeneralResponse(res, false, 'Username, email, and password are required', 400);
    }

    if (!validateEmail(email)) {
        return sendGeneralResponse(res, false, 'Invalid email', 400);
    }

    try {
        const existingUser = await User.findOne({ $or: [{ email }] });
        if (existingUser) {
            return sendGeneralResponse(res, false, 'Email already registered', 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            email,
            password: hashedPassword
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


module.exports = {login ,register}