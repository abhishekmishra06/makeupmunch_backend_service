const multer = require('multer');
const { uploadImage } = require('../utils/uploadImages');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendGeneralResponse } = require('../utils/responseHelper');
const { validateEmail, validatePhone, validateRequiredFields, validateRequiredAddressFields, validateServicesFormat } = require('../utils/validation');
const User = require('../models/userModel');
const { sendMail } = require('../utils/mailer');
const upload = multer({ storage: multer.memoryStorage() });



 
const login = async (req, res) => {
    const { email, password } = req.body;
  
    if (!email) {
      return sendGeneralResponse(res, false, "Email field is required", 400);
    }
  
    if (!password) {
      return sendGeneralResponse(res, false, "Password field is required", 400);
    }
  
    try {
      const user = await User.User.findOne({ email });
  
      if (!user) {
        return sendGeneralResponse(res, false, 'User not registered', 400);
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
  
        user.refreshToken = refreshToken;
  
        // await user.save();
        await User.User.updateOne({ _id: user._id }, { $set: { refreshToken } });

        return sendGeneralResponse(res, true, 'Login successful', 200, { ...user._doc, accessToken, refreshToken });
      } else {
        return sendGeneralResponse(res, false, 'Invalid password', 400);
      }
    } catch (error) {
      console.error('Login error:', error);
      return sendGeneralResponse(res, false, "Internal server error", 500);
    }
  };







   
const Salonlogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return sendGeneralResponse(res, false, "Email field is required", 400);
  }

  if (!password) {
    return sendGeneralResponse(res, false, "Password field is required", 400);
  }

  try {
    const user = await User.Salon.findOne({ email });

    if (!user) {
      return sendGeneralResponse(res, false, 'User not registered', 400);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      user.refreshToken = refreshToken;

      // await user.save();
      await User.Salon.updateOne({ _id: user._id }, { $set: { refreshToken } });

      return sendGeneralResponse(res, true, 'Login successful', 200, { ...user._doc, accessToken, refreshToken });
    } else {
      return sendGeneralResponse(res, false, 'Invalid password', 400);
    }
  } catch (error) {
    console.error('Login error:', error);
    return sendGeneralResponse(res, false, "Internal server error", 500);
  }
};




 



const registerUser = async (req, res) => {
    if (!req.body) {
        return sendGeneralResponse(res, false, 'Request body is missing', 400);
    }
  
    const { username, email, password, phone, gender, role } = req.body;
  
    if (!username) {
        return sendGeneralResponse(res, false, 'Username is required', 400);
    }
    if (!email) {
        return sendGeneralResponse(res, false, 'Email is required', 400);
    }
    if (!password) {
        return sendGeneralResponse(res, false, 'Password is required', 400);
    }
    if (!phone) {
        return sendGeneralResponse(res, false, 'Phone number is required', 400);
    }
    if (!gender) {
        return sendGeneralResponse(res, false, 'Gender is required', 400);
    }
    if (!role) {
        return sendGeneralResponse(res, false, 'Role is required', 400);
    }
    if (!req.file) {
        return sendGeneralResponse(res, false, 'Profile image is required', 400);
    }
  
    if (!validateEmail(email)) {
        return sendGeneralResponse(res, false, 'Invalid email', 400);
    }
     
    try {
        const existingUser = await User.Customer.findOne({ email });
        if (existingUser) {
            return sendGeneralResponse(res, false, 'Email already registered', 400);
        }
 
        let profile_img_url = null;
        if (req.file) {
            profile_img_url = await uploadImage(req.file.buffer, 'profile_img_' + Date.now());
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User.Customer({
            username,
            email,
            password: hashedPassword,
            phone,
            gender,
            profile_img: profile_img_url,
            role
        });

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        user.refreshToken = refreshToken;

        await user.save();

        // Rest of the email sending code remains the same
        const subject = 'Welcome to MakeUp Munch!';
        const text = `Hi ${username},\n\nThank you for registering with us. We're excited to have you onboard!`;

        const html = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
            <div style="background-color: white; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <div style="background-color: #FFB6C1; padding: 10px; color: white; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1>Welcome to Our Service!</h1>
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

                             <div style="margin-top: 20px; text-align: center; color: #777; font-size: 12px;">
                    <p>&copy; 2024 Our Service. All Rights Reserved.</p>
                </div>
                    </div>
                </div>12
                
            </div>
        </div>
    `;

        await sendMail(email, subject, text, html);
        
        sendGeneralResponse(res, true, 'Registered successfully', 200, { ...user._doc, accessToken, refreshToken });
    } catch (error) {
        console.error('Registration error:', error);
        sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};








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
    city,
    specialties,
    role,
    availability,
    gender,
    paymentMethods,
    advanceAmount
  } = req.body;

  const requiredFields = [
    'businessName', 'username', 'email', 'password', 'phone', 'role', 'city', 'specialties',
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
    const existingUser = await User.Artist.findOne({ email });

    if (existingUser) {
      return sendGeneralResponse(res, false, 'Email already registered', 400);
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

    sendGeneralResponse(res, true, 'Registered successfully', 200, {
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
    console.error('Registration error:', error);
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
    'businessName', 'username', 'email', 'password', 'phone', 'city', 'role' ,  'numberOfArtists',
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
      role:salon.role,
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














const getAccessToken = async (req, res) => {
    const { refreshToken } = req.body;

   
    if (!refreshToken) {
      return sendGeneralResponse(res, false, 'Refresh token is missing', 400);
    }
  
    try {
       
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
  
      const user = await User.findById(decoded.id);
   
      if (!user || user.refreshToken !== refreshToken) {
        return sendGeneralResponse(res, false, 'Invalid refresh token', 403);
      }
  
      
      const newAccessToken = generateAccessToken(user._id);
      const newRefreshToken = generateRefreshToken(user._id);
  
      // Update user's refresh token in the database
      user.refreshToken = newRefreshToken;
      await user.save();
  
      // Return new access token
      sendGeneralResponse(res, true, 'Token refreshed successfully', 200, { accessToken: newAccessToken , refreshToken: newRefreshToken });
    } catch (error) {
      console.error('Error refreshing token:', error);
      sendGeneralResponse(res, false, 'Invalid or expired refresh token', 403);
    }
  };
  







  

const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, { expiresIn: '5000000h' });
  };
  
  const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: '700000000d' });  
  };



  const register = async (req, res) => {
     if (!req.body) {
        return sendGeneralResponse(res, false, 'Request body is missing', 400);
    }
  
    const { role } = req.body;
  
    // Handle role-specific registration
    if (role === 'artist') {
         return registerArtist(req, res);
    } else {
        return registerUser(req, res);
    }
  };
  



module.exports = { login, register , getAccessToken  , registerSalon , Salonlogin} 


















// const verifyEmailOtp = async (req, res) => {
//   const { email, otp } = req.body;

//   // Check if email is provided
//   if (!email) {
//     return sendGeneralResponse(res, false, "Email is required", 400);
//   }

//   // Check if OTP is provided
//   if (!otp) {
//     return sendGeneralResponse(res, false, "OTP is required", 400);
//   }

//   // Validate email format
//   if (!validateEmail(email)) {
//     return sendGeneralResponse(res, false, "Invalid email", 400);
//   }

//   try {
//     // Find OTP entry in the database
//     const otpEntry = await Otp.findOne({ email });

//     // Check if OTP entry exists
//     if (!otpEntry) {
//       return sendGeneralResponse(res, false, "Please request a new OTP", 400);
//     }

//     const { otpHash, expiresAt } = otpEntry;

//     // Log current time and expiration time for debugging
//     console.log("Current Time:", Date.now());
//     console.log("OTP Expiration Time:", expiresAt);

//     // Check if OTP has expired
//     if (Date.now() > expiresAt) {
//       // Clean up expired OTP
//       await Otp.deleteMany({ email });
//       return sendGeneralResponse(
//         res,
//         false,
//         "The OTP has expired. Please request a new one.",
//         400
//       );
//     }

//     // Compare provided OTP with stored OTP hash
//     const isValid = await bcrypt.compare(otp, otpHash);
//     if (isValid) {
//       // Delete OTP entry after successful verification
//       await Otp.deleteMany({ email });

//       return sendGeneralResponse(res, true, "OTP verified successfully", 200);
//     } else {
//       return sendGeneralResponse(res, false, "Invalid OTP", 400);
//     }
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     return sendGeneralResponse(res, false, "Internal server error", 500);
//   }
// };



























// const register = async (req, res) => {
//   if (!req.body) {
//       return sendGeneralResponse(res, false, 'Request body is missing', 400);
//   }

//   const { role } = req.body;

//   // Handle role-specific registration
//   if (role === 'artist') {
//       return registerArtist(req, res);
//   } else {
//       return registerUser(req, res);
//   }
// };



// const registerUser = async (req, res) => {
//   const { username, email, password, dob, address, phone, gender } = req.body;

//   // Validate common required fields
//   const requiredFields = ['username', 'email', 'password', 'dob', 'address', 'phone', 'gender'];
//   const validationError = validateRequiredFields(req.body, requiredFields);
//   if (validationError) return validationError;

//   // Validate address
//   const addressFields = ['pinCode', 'state', 'city', 'street', 'area', 'nearby'];
//   const addressError = validateRequiredAddressFields(address, addressFields);
//   if (addressError) return addressError;

//   // Proceed with registration
//   return handleUserRegistration({ username, email, password, dob, address, phone, gender, role: 'user' }, res);
// };

// const registerArtist = async (req, res) => {
//   const { username, email, password, dob, address, phone, gender, paymentMethod, services, specialties, advanceBookingAmount } = req.body;

//   // Validate required fields for artist
//   const requiredFields = ['username', 'email', 'password', 'dob', 'address', 'phone', 'gender', 'paymentMethod', 'services', 'specialties', 'advanceBookingAmount'];
//   const validationError = validateRequiredFields(req.body, requiredFields);
//   if (validationError) return validationError;

//   // Validate address
//   const addressFields = ['pinCode', 'state', 'city', 'street', 'area', 'nearby'];
//   const addressError = validateRequiredAddressFields(address, addressFields);
//   if (addressError) return addressError;

//   // Validate services format
//   const servicesError = validateServicesFormat(services);
//   if (servicesError) return servicesError;

//   // Proceed with registration
//   return handleUserRegistration({ username, email, password, dob, address, phone, gender, role: 'artist', paymentMethod, services, specialties, advanceBookingAmount }, res);
// };

// const handleUserRegistration = async (userData, res) => {
//   const { email, password } = userData;

//   if (!validateEmail(email)) {
//       return sendGeneralResponse(res, false, 'Invalid email', 400);
//   }

//   try {
//       const existingUser = await User.findOne({ email });
//       if (existingUser) {
//           return sendGeneralResponse(res, false, 'Email already registered', 400);
//       }

//       const hashedPassword = await bcrypt.hash(password, 10);
//       const newUser = new User({ ...userData, password: hashedPassword, profile_img: "profile_img_url" });
//       await newUser.save();

//       const accessToken = generateAccessToken(newUser._id);
//       const refreshToken = generateRefreshToken(newUser._id);
//       newUser.refreshToken = refreshToken;

//       await sendWelcomeEmail(newUser.username, email);
//       sendGeneralResponse(res, true, 'Registered successfully', 200, { ...newUser._doc, accessToken, refreshToken });
//   } catch (error) {
//       console.error('Registration error:', error);
//       sendGeneralResponse(res, false, 'Internal server error', 500);
//   }
// };

// const validateRequiredFields = (body, fields) => {
//   for (const field of fields) {
//       if (!body[field]) {
//           return sendGeneralResponse(res, false, `${field.charAt(0).toUpperCase() + field.slice(1)} is required`, 400);
//       }
//   }
//   return null;
// };

// const validateRequiredAddressFields = (address, fields) => {
//   for (const field of fields) {
//       if (!address[field]) {
//           return sendGeneralResponse(res, false, `Address ${field} is required`, 400);
//       }
//   }
//   return null;
// };

// const validateServicesFormat = (services) => {
//   for (const service of services) {
//       if (!service.service || !Array.isArray(service.subServices) || service.subServices.length === 0) {
//           return sendGeneralResponse(res, false, 'Each service must have a name and at least one subService', 400);
//       }
//   }
//   return null;
// };

// const sendWelcomeEmail = async (username, email) => {
//   // Email sending logic...
// };


