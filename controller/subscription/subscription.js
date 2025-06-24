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
     


         
        const emailTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Makeup Munch Newsletter</title>
        </head>
        <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #FFF0F5;">
            <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-collapse: collapse; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <tr>
                    <td style="padding: 30px 0; text-align: center; background-color: #FF1493;">
                        <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Welcome to Makeup Munch!</h1>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 30px;">
                        <p style="font-size: 16px; color: #333; text-align: center;">Thank you for subscribing to our beauty newsletter! Get ready to feast on the latest makeup trends, skincare tips, and exclusive offers.</p>
                        
                        <h2 style="color: #FF1493; text-align: center; margin-top: 30px;">What's on our beauty menu:</h2>
                        <ul style="color: #333; font-size: 16px; margin-bottom: 30px;">
                            <li>Weekly makeup tutorials</li>
                            <li>Skincare routines for all skin types</li>
                            <li>Exclusive discounts on top beauty brands</li>
                            <li>New product reviews and recommendations</li>
                        </ul>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="https://makeupmunch.com/shop" style="background-color: #FF1493; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Explore Our Beauty Collection</a>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 30px; background-color: #FFF0F5; text-align: center;">
                        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Connect with us for daily beauty inspiration:</p>
                        <a href="https://www.facebook.com/makeupmunch" style="text-decoration: none; margin: 0 10px;">
                            <img src="https://img.icons8.com/ios-filled/30/FF1493/facebook-new.png" alt="Facebook" />
                        </a>
                        <a href="https://www.instagram.com/makeupmunch" style="text-decoration: none; margin: 0 10px;">
                            <img src="https://img.icons8.com/ios-filled/30/FF1493/instagram-new.png" alt="Instagram" />
                        </a>
                        <a href="mailto:support@makeupmunch.com" style="text-decoration: none; margin: 0 10px;">
                            <img src="https://img.icons8.com/ios-filled/30/FF1493/support.png" alt="Support" />
                        </a>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 30px; text-align: center; font-size: 14px; color: #777;">
                        <p>&copy; 2024 Makeup Munch. All Rights Reserved.</p>
                        <p>You're receiving this email because you signed up for our beauty newsletter. If you believe this is an error, please <a href="mailto:support@makeupmunch.com" style="color: #FF1493; text-decoration: none;">contact us</a>.</p>
                        <p><a href="https://makeupmunch.com/unsubscribe" style="color: #FF1493; text-decoration: none;">Unsubscribe</a></p>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;

        await sendMail({
            to: email,
            subject: 'Welcome to Our Beauty Newsletter!',
            text: '',
            html: emailTemplate
        });
 

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
         <p style="font-size: 16px; color: #34495e; text-align: center;">You have successfully unsubscribed from our newsletter. We're sad to see you go, but we understand.</p>

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

     await sendMail({
         to: email,
         subject: 'You Have Unsubscribed',
         text: '',
         html: emailTemplate
     });
 
         sendGeneralResponse(res, true, 'Unsubscribed successfully!', 200);
 
     } catch (error) {
         console.error('Unsubscribe error:', error);
         sendGeneralResponse(res, false, 'Internal server error', 500);
     }
 };
 
 module.exports = { subscribe, unsubscribe };
