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

        //  const mailOptions = {
        //     from: 'your_email@gmail.com',
        //     to: email,
        //     subject: 'Welcome to Our Beauty Newsletter!',
        //     html: `<h1>Thank You for Subscribing!</h1>
        //            <p>We are excited to share the latest beauty tips and exclusive offers with you.</p>
        //            <p>Stay tuned!</p>`,
        // };

        // await transporter.sendMail(mailOptions);


        await sendMail(email, 'Welcome to Our Beauty Newsletter!', `` , `<h1>Thank You for Subscribing!</h1>
           <p>We are excited to share the latest beauty tips and exclusive offers with you.</p>
            <p>Stay tuned!</p>`,);
 

         sendGeneralResponse(res, true, 'Subscribed successfully!', 200);

    } catch (error) {
        console.error('Subscription error:', error);
          sendGeneralResponse(res, false, 'Internal server error', 500);

     }
};



module.exports = { subscribe };