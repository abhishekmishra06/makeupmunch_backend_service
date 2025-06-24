const User = require("../../models/userModel");
const { generateAccessToken, generateRefreshToken } = require("../../utils/jwt_token");
const { sendMail } = require("../../utils/mailer");

const { sendGeneralResponse } = require("../../utils/responseHelper");
const { uploadImage } = require("../../utils/uploadImages");
const { validateEmail, validateRequiredFields } = require("../../utils/validation");
const bcrypt = require('bcrypt');
const { verifyPhoneOtpHelper } = require("../otpController");


// for user register 
const registerUser = async (req, res) => {
    console.log('=== REGISTER USER FUNCTION CALLED ===');
    console.log('Request body in registerUser:', JSON.stringify(req.body, null, 2));
    
    try {
        if (!req.body) {
            console.log('Request body is missing');
            return sendGeneralResponse(res, false, 'Request body is missing', 400);
        }

        const { email, phone, phoneOtp, gender, role, fcmToken } = req.body;
        console.log('Extracted fields:', { email, phone, phoneOtp, gender, role, fcmToken });

        // Validate required fields
        if (!phone) {
            return sendGeneralResponse(res, false, 'Phone number is required', 400);
        }

        if (!role) {
            return sendGeneralResponse(res, false, 'Role is required', 400);
        }

        if (!phoneOtp) {
            return sendGeneralResponse(res, false, 'phoneOtp is required', 400);
        }

        const allowedRoles = ['customer'];  // only customer is allowed here
        if (!allowedRoles.includes(role)) {
            return sendGeneralResponse(res, false, `Invalid role '${role}'. Allowed role: ${allowedRoles.join(', ')}`, 400);
        }

        const existingUser = await User.Customer.findOne({ phone });
        if (existingUser) {
            return sendGeneralResponse(res, false, 'Phone number already registered', 400);
        }

        // Validate email if provided
        if (email && !validateEmail(email)) {
            return sendGeneralResponse(res, false, 'Invalid email', 400);
        }

        // Check if email already exists if provided
        if (email) {
            const existingEmail = await User.Customer.findOne({ email });
            if (existingEmail) {
                return sendGeneralResponse(res, false, 'Email already registered', 400);
            }
        }

        // Verify phone OTP
        console.log('Verifying phone OTP...');
        const otpResult = await verifyPhoneOtpHelper(phone, phoneOtp);
        console.log('OTP verification result:', otpResult);
        if (!otpResult.status) {
            return sendGeneralResponse(res, false, otpResult.message, otpResult.code);
        }

        // Generate username from email or phone
        let username = email ? email.split('@')[0].replace(/(\d{3,})$/, '') : `user${phone.slice(-4)}`;

        // Generate a random password since login will be via phone OTP
        const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        console.log('Creating user with data:', {
            username,
            email: email || '',
            phone,
            role,
            gender: gender || '',
            hasPasswordHash: !!hashedPassword
        });

        // Create new user
        const user = new User.Customer({
            username,
            email: email || '',
            password: hashedPassword, // Use hashed random password instead of empty string
            phone,
            gender: gender || '', // Optional field
            role,
            profile_img: null, // Optional field
            email_verify: email ? false : '', // Set to false if email provided, empty string if not
            fcmToken,
            isLogin: true,
            lastLoginAt: new Date(),
        });

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        user.refreshToken = refreshToken;

        console.log('Saving user to database...');
        // Save user
        await user.save();
        console.log('User saved successfully with ID:', user._id);

        // Send welcome email only if email is provided
        if (email) {
            const subject = 'Welcome to MakeUp Munch!';
            const text = `Hi ${username},\n\nThank you for registering with us. We're excited to have you onboard!`;
            const html = `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
                    <div style="background-color: white; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                        <div style="background-color: #FFB6C1; padding: 10px; color: white; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1>Welcome to MakeUp Munch!</h1>
                        </div>
                        <div style="padding: 20px;">
                            <h2 style="color: #333;">Hello, ${username}!</h2>
                            <p>We are thrilled to have you on board. Thank you for registering with us!</p>
                            <p>You can now start using all the services we offer. If you have any questions, feel free to reach out to our support team.</p>
                            <p>We hope you have a great experience with us!</p>
                            <a href="https://makeup-adda.netlify.app/" style="display: inline-block; background-color: #FFB6C1; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; margin-top: 20px;">Visit Our Website</a>
                            <p style="margin-top: 20px;">Follow us on social media:</p>
                            <div style="text-align: center; margin-top: 10px;"> 
                                <a href="https://www.facebook.com/yourpage" style="margin-right: 10px;">
                                    <img src="https://img.icons8.com/ios-filled/24/FF69B4/facebook-new.png" alt="Facebook" />
                                </a>
                                <a href="https://www.instagram.com/yourpage" style="margin-right: 10px;">
                                    <img src="https://img.icons8.com/ios-filled/24/FF69B4/instagram-new.png" alt="Instagram" />
                                </a>
                                <a href="mailto:support@yourservice.com">
                                    <img src="https://img.icons8.com/ios-filled/24/FF69B4/support.png" alt="Support" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            try {
                await sendMail({
                    to: email,
                    subject,
                    text,
                    html
                });
                console.log('Welcome email sent successfully');
            } catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
                // Don't fail registration if email sending fails
            }
        }

        console.log('Registration completed successfully');
        // Send success response
        return sendGeneralResponse(res, true, 'Registered successfully', 200, {
            _id: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            gender: user.gender,
            role: user.role,
            profile_img: user.profile_img,
            accessToken,
            refreshToken,
            isLogin: true,
            lastLoginAt: new Date(),
        });

    } catch (error) {
        console.error('Registration error:', error);
        return sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};






//  for artist register 
const registerArtist = async (req, res) => {
    if (!req.body) {
        return sendGeneralResponse(res, false, 'Request body is missing', 400);
    }

    const {
        businessName,
        username,
        email,
        password,
        phone,
        phoneOtp,
        city,
        specialties,
        role,
        fcmToken,
        availability,
        gender,
        paymentMethods,
        advanceAmount,
    } = req.body;

    const requiredFields = [
        'businessName', 'username', 'email', 'password', 'phone', 'phoneOtp', 'role', 'city', 'specialties',
        'availability', 'gender', 'paymentMethods', 'advanceAmount'
    ];

    if (!req.file) {
        return sendGeneralResponse(res, false, 'Profile image is required', 400);
    }

    const validationError = validateRequiredFields(res, req.body, requiredFields);
    if (validationError) return validationError;

    if (!specialties || !Array.isArray(specialties) || specialties.length === 0) {
        return sendGeneralResponse(res, false, 'Specialties are required for artists', 400);
    }

    if (!validateEmail(email)) {
        return sendGeneralResponse(res, false, 'Invalid email', 400);
    }

    // Validate new fields
    if (!['day', 'night', 'both'].includes(availability)) {
        return sendGeneralResponse(res, false, 'Invalid availability option', 400);
    }

    if (!['male', 'female', 'other'].includes(gender)) {
        return sendGeneralResponse(res, false, 'Invalid gender option', 400);
    }

    if (!Array.isArray(paymentMethods) || !paymentMethods.every(method => ['online', 'cash'].includes(method))) {
        return sendGeneralResponse(res, false, 'Invalid payment methods', 400);
    }

    // Updated validation for advanceAmount
    const validAdvanceAmounts = [10, 20, 30, 40, 50];
    if (!validAdvanceAmounts.includes(Number(advanceAmount))) {
        return sendGeneralResponse(res, false, 'Invalid advance amount. Must be 10, 20, 30, 40, or 50.', 400);
    }

    try {
        // Check if email already exists
        const existingUserByEmail = await User.Artist.findOne({ email });
        if (existingUserByEmail) {
            return sendGeneralResponse(res, false, 'Email already registered', 400);
        }

        // Check if phone already exists
        const existingUserByPhone = await User.Artist.findOne({ phone });
        if (existingUserByPhone) {
            return sendGeneralResponse(res, false, 'Phone number already registered', 400);
        }

        // Verify phone OTP
        console.log('Verifying phone OTP for artist registration...');
        const otpResult = await verifyPhoneOtpHelper(phone, phoneOtp);
        console.log('OTP verification result:', otpResult);
        if (!otpResult.status) {
            return sendGeneralResponse(res, false, otpResult.message, otpResult.code);
        }

        let profile_img_url = null;

        if (req.file) {
            profile_img_url = await uploadImage(req.file.buffer, 'profile_img_' + Date.now());
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = {
            businessName,
            username,
            email,
            password: hashedPassword,
            phone,
            city,
            profile_img: profile_img_url,
            specialties,
            role,
            fcmToken,
            isLogin: true,
            lastLoginAt: new Date(),
            availability,
            gender,
            paymentMethods,
            advanceAmount: Number(advanceAmount)
        };

        const user = new User.Artist(userData);
        await user.save();

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        user.refreshToken = refreshToken;
        await user.save();

        // Send welcome email
        const subject = 'Welcome to MakeUp Munch - Artist Registration Successful!';
        const text = `Hi ${username},\n\nCongratulations! Your artist account has been successfully created. Welcome to MakeUp Munch!`;
        const html = `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
                <div style="background-color: white; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #FFB6C1; padding: 10px; color: white; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1>Welcome to MakeUp Munch!</h1>
                    </div>
                    <div style="padding: 20px;">
                        <h2 style="color: #333;">Hello, ${username}!</h2>
                        <p>Congratulations! Your artist account has been successfully created.</p>
                        <p><strong>Business Name:</strong> ${businessName}</p>
                        <p><strong>Specialties:</strong> ${specialties.join(', ')}</p>
                        <p>You can now start offering your services and connecting with customers. Access your dashboard to manage your profile and bookings.</p>
                        <a href="https://makeup-adda.netlify.app/artistdashboard" style="display: inline-block; background-color: #FFB6C1; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; margin-top: 20px;">Access Artist Dashboard</a>
                    </div>
                </div>
            </div>
        `;

        try {
            await sendMail({
                to: email,
                subject,
                text,
                html
            });
            console.log('Welcome email sent successfully to artist');
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail registration if email sending fails
        }

        sendGeneralResponse(res, true, 'Artist registered successfully', 200, {
            _id: user._id,
            businessName: user.businessName,
            username: user.username,
            email: user.email,
            phone: user.phone,
            city: user.city,
            specialties: user.specialties,
            profile_img: user.profile_img,
            refreshToken: user.refreshToken,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            role: user.role,
            availability: user.availability,
            gender: user.gender,
            paymentMethods: user.paymentMethods,
            advanceAmount: user.advanceAmount,
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error('Artist registration error:', error);
        sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};



const registerSalon = async (req, res) => {
    if (!req.body) {
        return sendGeneralResponse(res, false, 'Request body is missing', 400);
    }

    const {
        businessName,
        role,
        username,
        email,
        password,
        phone,
        city,
        numberOfArtists,
    } = req.body;


    const numArtists = parseInt(numberOfArtists, 10); // Use parseInt or Number


    const requiredFields = [
        'businessName', 'username', 'email', 'password', 'phone', 'city', 'role', 'numberOfArtists',
    ];

    if (!req.file) {
        return sendGeneralResponse(res, false, 'Profile image is required', 400);
    }

    const validationError = validateRequiredFields(res, req.body, requiredFields);
    if (validationError) return validationError;

    // Validate email
    if (!validateEmail(email)) {
        return sendGeneralResponse(res, false, 'Invalid email', 400);
    }

    // Validate numberOfArtists
    if (!Number.isInteger(numArtists) || numArtists <= 0) {
        return sendGeneralResponse(res, false, 'Number of artists must be a positive integer greater than 0', 400);
    }


    try {
        const existingUser = await User.Salon.findOne({ email });

        if (existingUser) {
            return sendGeneralResponse(res, false, 'Email already registered', 400);
        }

        let profile_img_url = null;

        if (req.file) {
            profile_img_url = await uploadImage(req.file.buffer, 'salon_img_' + Date.now());
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const salonData = {
            businessName,
            username,
            email,
            role,
            password: hashedPassword,
            phone,
            city,
            profile_img: profile_img_url,
            numberOfArtists: Number(numberOfArtists),
        };

        const salon = new User.Salon(salonData);
        await salon.save();

        const accessToken = generateAccessToken(salon._id);
        const refreshToken = generateRefreshToken(salon._id);
        salon.refreshToken = refreshToken;
        await salon.save();

        sendGeneralResponse(res, true, 'Registered successfully', 200, {
            _id: salon._id,
            businessName: salon.businessName,
            username: salon.username,
            email: salon.email,
            phone: salon.phone,
            role: salon.role,
            city: salon.city,
            profile_img: salon.profile_img,
            refreshToken: salon.refreshToken,
            createdAt: salon.createdAt,
            updatedAt: salon.updatedAt,
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.error('Registration error:', error);
        sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};



// register function
const register = async (req, res) => {
    console.log('=== REGISTER FUNCTION CALLED ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request headers:', req.headers);
    
    if (!req.body) {
        return sendGeneralResponse(res, false, 'Request body is missing', 400);
    }

    const { role } = req.body;
    console.log('Role from request:', role);

    // Handle role-specific registration
    if (role === 'artist') {
        console.log('Calling registerArtist');
        return registerArtist(req, res);
    } else {
        console.log('Calling registerUser');
        return registerUser(req, res);
    }
};



module.exports = { registerUser, registerArtist, registerSalon, register }
