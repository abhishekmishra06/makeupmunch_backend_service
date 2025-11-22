const generateEmailVerificationTemplate = (otp, userName = 'Valued Customer') => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Makeup Munch</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header Section -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; position: relative;">
            <div style="background-color: rgba(255, 255, 255, 0.1); border-radius: 50%; width: 100px; height: 100px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="10" y="20" width="40" height="25" rx="3" fill="white" opacity="0.9"/>
                    <path d="M10 22 L30 35 L50 22" stroke="#667eea" stroke-width="2" fill="none"/>
                    <circle cx="42" cy="25" r="8" fill="#27ae60"/>
                    <path d="M38 25 L41 28 L46 22" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h1 style="color: white; font-size: 28px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                Verify Your Email
            </h1>
            <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 10px 0 0 0;">
                Complete your registration with Makeup Munch
            </p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">
            <h2 style="color: #2c3e50; font-size: 24px; font-weight: 600; margin: 0 0 20px 0; text-align: center;">
                Hello ${userName}!
            </h2>
            
            <p style="color: #5a6c7d; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
                Welcome to <strong style="color: #667eea;">Makeup Munch</strong>! We're thrilled to have you join our beauty community. 
                To complete your registration and secure your account, please verify your email address.
            </p>

            <!-- OTP Display -->
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 15px; padding: 30px; text-align: center; margin: 30px 0; border: 2px solid #e1e8ed;">
                <p style="color: #6c757d; font-size: 14px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                    Your Verification Code
                </p>
                <div style="background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: inline-block;">
                    <span style="font-size: 36px; font-weight: 700; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${otp}
                    </span>
                </div>
                <p style="color: #6c757d; font-size: 12px; margin: 15px 0 0 0;">
                    This code expires in 5 minutes
                </p>
            </div>

            <!-- Instructions -->
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 10px; padding: 20px; margin: 25px 0;">
                <h3 style="color: #856404; font-size: 16px; margin: 0 0 10px 0; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">⚡</span>
                    Quick Steps to Verify:
                </h3>
                <ol style="color: #856404; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.5;">
                    <li>Copy the 6-digit code above</li>
                    <li>Return to the verification page</li>
                    <li>Paste the code and click "Verify Email"</li>
                    <li>Start your beauty journey with us!</li>
                </ol>
            </div>

            <!-- Call to Action -->
            <div style="text-align: center; margin: 35px 0;">
                <p style="color: #5a6c7d; font-size: 14px; margin: 0 0 20px 0;">
                    Having trouble? You can also click the button below to verify automatically:
                </p>
                <a href="${process.env.FRONTEND_URL || 'https://www.makeupmunch.in'}/email-verification?token=${otp}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
                    Verify Email Automatically
                </a>
            </div>

            <!-- Security Notice -->
            <div style="background-color: #f8f9fa; border-left: 4px solid #17a2b8; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                <h4 style="color: #17a2b8; font-size: 16px; margin: 0 0 10px 0; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">🔒</span>
                    Security Notice
                </h4>
                <p style="color: #5a6c7d; font-size: 14px; margin: 0; line-height: 1.5;">
                    If you didn't create an account with Makeup Munch, please ignore this email. 
                    Your security is our priority - this verification code will expire automatically.
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); padding: 30px 20px; text-align: center;">
            <h3 style="color: white; font-size: 20px; margin: 0 0 15px 0;">
                Welcome to Your Beauty Journey! 💄
            </h3>
            <p style="color: rgba(255, 255, 255, 0.8); font-size: 14px; margin: 0 0 20px 0; line-height: 1.5;">
                Discover professional makeup artists, book amazing services, and transform your look with Makeup Munch.
            </p>
            
            <!-- Social Links -->
            <div style="margin: 20px 0;">
                <a href="#" style="text-decoration: none; margin: 0 10px; display: inline-block;">
                    <div style="background-color: rgba(255, 255, 255, 0.1); border-radius: 50%; width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
                        <span style="color: white; font-size: 18px;">📘</span>
                    </div>
                </a>
                <a href="#" style="text-decoration: none; margin: 0 10px; display: inline-block;">
                    <div style="background-color: rgba(255, 255, 255, 0.1); border-radius: 50%; width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
                        <span style="color: white; font-size: 18px;">📷</span>
                    </div>
                </a>
                <a href="#" style="text-decoration: none; margin: 0 10px; display: inline-block;">
                    <div style="background-color: rgba(255, 255, 255, 0.1); border-radius: 50%; width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
                        <span style="color: white; font-size: 18px;">🐦</span>
                    </div>
                </a>
            </div>
            
            <div style="border-top: 1px solid rgba(255, 255, 255, 0.2); padding-top: 20px; margin-top: 20px;">
                <p style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin: 0;">
                    © 2025 Makeup Munch. All Rights Reserved.<br>
                    This email was sent to verify your account registration.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

module.exports = {
  generateEmailVerificationTemplate
}; 