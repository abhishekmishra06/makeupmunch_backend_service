const multer = require('multer');
const { uploadImage } = require('../utils/uploadImages');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendGeneralResponse } = require('../utils/responseHelper');
const { validateEmail, validatePhone } = require('../utils/validation');
const User = require('../models/userModel');
const { sendMail } = require('../utils/mailer');
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
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
  
        user.refreshToken = refreshToken;
  
        await user.save();
  
        return sendGeneralResponse(res, true, 'Login successful', 200, { ...user._doc, accessToken, refreshToken });
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
  
    const { username, email, password, dob, address, phone, gender, role } = req.body;
  
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
            profile_img: profile_img_url ,
            role
        });

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        
        // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        // user.token = token;

        user.refreshToken = refreshToken;

        await user.save();

        // Send email for confermation you are registering

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
                    <a href="https://yourwebsite.com" style="display: inline-block; background-color: #FFB6C1; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; margin-top: 20px;">Visit Our Website</a>
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
        
        
    
        
        
        sendGeneralResponse(res, true, 'Registered successfully', 200, { ...user._doc,accessToken , refreshToken });
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
    return jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
  };
  
  const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: '7d' });  
  };





module.exports = { login, register , getAccessToken} 