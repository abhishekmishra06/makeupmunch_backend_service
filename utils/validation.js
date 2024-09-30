const { sendGeneralResponse } = require("./responseHelper");

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
};


const validateRequiredFields = ( res, body, fields) => {
    for (const field of fields) {
        if (!body[field]) {
            return sendGeneralResponse(res, false, `${field.charAt(0).toUpperCase() + field.slice(1)} is required`, 400);
        }
    }
    return null;
  };
  
  const validateRequiredAddressFields = (res, address, fields) => {
    for (const field of fields) {
        if (!address[field]) {
            return sendGeneralResponse(res, false, `Address ${field} is required`, 400);
        }
    }
    return null;
  };
  
//   const validateServicesFormat = (services) => {
//     for (const service of services) {
//         if (!service.service || !Array.isArray(service.subServices) || service.subServices.length === 0) {
//             return sendGeneralResponse(res, false, 'Each service must have a name and at least one subService', 400);
//         }
//     }
//     return null;
//   };




const validateServicesFormat = (res, services) => {
    if (!Array.isArray(services) || services.length === 0) {
        return sendGeneralResponse(res, false, 'Services are required for artists', 400);
    }

    for (const service of services) {
        if (!service.service || !Array.isArray(service.subServices) || service.subServices.length === 0) {
            return sendGeneralResponse(res, false, 'Each service must have a name and at least one subService', 400);
        }

        for (const subService of service.subServices) {
            if (!subService.name || typeof subService.price !== 'number' || subService.price <= 0) {
                return sendGeneralResponse(res, false, 'Each subService must have a valid name and a positive price', 400);
            }
        }
    }

    return null; // No error
};



module.exports = {
     validateEmail, validatePhone ,validateRequiredFields ,  validateRequiredAddressFields , validateServicesFormat
}; 














// const registerArtist = async (req, res) => {
//     const { username, email, password, dob, address, phone, gender, paymentMethod, services, specialties, advanceBookingAmount } = req.body;
  
//     // Validate required fields for artist
//     const requiredFields = ['username', 'email', 'password', 'dob', 'address', 'phone', 'gender', 'paymentMethod', 'services', 'specialties', 'advanceBookingAmount'];
//     const validationError = validateRequiredFields(req.body, requiredFields);
//     if (validationError) return validationError;
  
//     // Validate address
//     const addressFields = ['pinCode', 'state', 'city', 'street', 'area', 'nearby'];
//     const addressError = validateRequiredAddressFields(address, addressFields);
//     if (addressError) return addressError;
  
//     // Validate services format
//     const servicesError = validateServicesFormat(services);
//     if (servicesError) return servicesError;
  
//     // Proceed with registration
//     return handleUserRegistration({ username, email, password, dob, address, phone, gender, role: 'artist', paymentMethod, services, specialties, advanceBookingAmount }, res);
//   };
  
//   const handleUserRegistration = async (userData, res) => {
//     const { email, password } = userData;
  
//     if (!validateEmail(email)) {
//         return sendGeneralResponse(res, false, 'Invalid email', 400);
//     }
  
//     try {
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return sendGeneralResponse(res, false, 'Email already registered', 400);
//         }
  
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newUser = new User({ ...userData, password: hashedPassword, profile_img: "profile_img_url" });
//         await newUser.save();
  
//         const accessToken = generateAccessToken(newUser._id);
//         const refreshToken = generateRefreshToken(newUser._id);
//         newUser.refreshToken = refreshToken;
  
//         await sendWelcomeEmail(newUser.username, email);
//         sendGeneralResponse(res, true, 'Registered successfully', 200, { ...newUser._doc, accessToken, refreshToken });
//     } catch (error) {
//         console.error('Registration error:', error);
//         sendGeneralResponse(res, false, 'Internal server error', 500);
//     }
//   };