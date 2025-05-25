const { sendGeneralResponse } = require("../../utils/responseHelper");

const adminLogin = async (req, res) => {
    const { email, password, role } = req.body;

    if (!email) {
        return sendGeneralResponse(res, false, "Email field is required", 400);
    }

    if (!password) {
        return sendGeneralResponse(res, false, "Password field is required", 400);
    }

    if (!role) {
        return sendGeneralResponse(res, false, "Role is required", 400); // Ensure role is provided
    }

    try {
        if (role === 'admin') {
            const predefinedAdminEmail = 'admin@example.com';  // Predefined admin email
            const predefinedAdminPassword = 'adminpassword';  // Predefined admin password

            if (email === predefinedAdminEmail && password === predefinedAdminPassword) {



                return sendGeneralResponse(res, true, 'Admin login successful', 200, {
                    role: 'admin',

                });
            } else {
                return sendGeneralResponse(res, false, 'Invalid email or password for admin', 400);
            }
        }

    } catch (error) {
        console.error('Login error:', error);
        return sendGeneralResponse(res, false, "Internal server error", 500);
    }
};



module.exports = { adminLogin };