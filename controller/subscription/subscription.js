const { sendGeneralResponse } = require("../../utils/responseHelper");
const { validateEmail } = require("../../utils/validation");
const Subscription = require('../../models/subscribeModel');
const { sendMail } = require("../../utils/mailer");


const subscribe=   async (req, res) => {
    const { email } = req.body;

     if (!email) {
         return sendGeneralResponse(res, false, 'Email is required', 400);
     }

 
     if (!validateEmail(email)) {
        return sendGeneralResponse(res, false, 'Invalid email', 400);
    } 
    
    try { 
         const existingSubscription = await Subscription.findOne({ email });

        if (existingSubscription) {
             return sendGeneralResponse(res, false, 'Email already subscribed', 400);

        }

         const newSubscription = new Subscription({ email });

        await newSubscription.save();
     //    const unsubscribeLink = `https://yourwebsite.com/unsubscribe?email=${encodeURIComponent(email)}`;
        const unsubscribeLink = `https://makeup-adda.netlify.app/`;


         
        const emailTemplate = `
            <div style="text-align: right; padding: 10px;">
    <a href="https://makeup-adda.netlify.app/" style="font-size: 12px; color: #e74c3c; text-decoration: none;">Unsubscribe</a>
</div>

<h1 style="text-align: center; color: #2c3e50;">Welcome to Our Beauty Newsletter!</h1>
<p style="font-size: 16px; color: #34495e; text-align: center;">Thank you for subscribing! We are excited to share the latest beauty tips and exclusive offers with you.</p>

<p style="font-size: 16px; color: #34495e; text-align: center;">Stay tuned for updates and offers delivered right to your inbox!</p>
                 
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

<hr style="border: 1px solid #ecf0f1; margin: 0px 0;">

<p style="font-size: 12px; color: #95a5a6; text-align: center;">You are receiving this email because you signed up for our beauty newsletter. If you believe this is an error, please <a href="mailto:support@yourwebsite.com" style="color: #2980b9; text-decoration: none;">contact us</a>.</p>
        `;

        await sendMail(email, 'Welcome to Our Beauty Newsletter!', '', emailTemplate);
 

         sendGeneralResponse(res, true, 'Subscribed successfully!', 200);

    } catch (error) {
        console.error('Subscription error:', error);
          sendGeneralResponse(res, false, 'Internal server error', 500);

     }
};


const unsubscribe = async (req, res) => {
     const { email } = req.body;
 
     if (!email) {
         return sendGeneralResponse(res, false, 'Email is required', 400);
     }
 
     if (!validateEmail(email)) {
         return sendGeneralResponse(res, false, 'Invalid email', 400);
     }
 
     try {
         const existingSubscription = await Subscription.findOne({ email });
 
         if (!existingSubscription) {
             return sendGeneralResponse(res, false, 'Email not found in our subscription list', 400);
         }
 
         // Remove the subscription from the database
         await Subscription.deleteOne({ email });
 
         // Send confirmation email to the user
         const emailTemplate = `
             <div style="text-align: right; padding: 10px;">
    <a href="https://makeup-adda.netlify.app/" style="font-size: 12px; color: #e74c3c; text-decoration: none;">Subscribe</a>
</div>
         <h1 style="text-align: center; color: #2c3e50;">We're Sorry to See You Go!</h1>
         <p style="font-size: 16px; color: #34495e; text-align: center;">You have successfully unsubscribed from our newsletter. We’re sad to see you go, but we understand.</p>

         <p style="font-size: 16px; color: #34495e; text-align: center;">If you ever change your mind, feel free to <a href="https://makeup-adda.netlify.app/" style="color: #2980b9; text-decoration: none;">subscribe again</a> anytime.</p>

                   <p style="font-size: 16px; color: #34495e; text-align: center;">We hope you have a great experience with us!</p>

         <div style="text-align: center; margin-top: 30px;">
             <a href="https://makeup-adda.netlify.app/" style="background-color: #3498db; color: white; padding: 15px 30px; font-size: 18px; text-decoration: none; border-radius: 5px;">
                 Subscribe Again
             </a>
         </div>

         <p style="font-size: 14px; color: #7f8c8d; text-align: center; margin-top: 40px;">If you didn't request this, or if you believe there's been an error, please <a href="mailto:support@yourwebsite.com" style="color: #2980b9; text-decoration: none;">contact us</a>.</p>
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

 
      `;

     await sendMail(email, 'You Have Unsubscribed', '', emailTemplate);
 
         sendGeneralResponse(res, true, 'Unsubscribed successfully!', 200);
 
     } catch (error) {
         console.error('Unsubscribe error:', error);
         sendGeneralResponse(res, false, 'Internal server error', 500);
     }
 };
 
 module.exports = { subscribe, unsubscribe };