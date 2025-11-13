const { sendGeneralResponse } = require('../../utils/responseHelper');
const Feedback = require('../../models/aiFeedbackModel');
const PreRegister = require('../../models/aiPreRegisterModel');

// --- Feedback API ---
const submitFeedback = async (req, res) => {
    try {
        const { name, email, feedback, rating, hearAboutUs } = req.body;

        if (!feedback) {
            return sendGeneralResponse(res, false, 'Feedback message is required', 400);
        }

        const newFeedback = new Feedback({
            name,
            email,
            feedback,
            rating,
            hearAboutUs
        });

        await newFeedback.save();

        return sendGeneralResponse(res, true, 'Feedback submitted successfully', 201, newFeedback);
    } catch (error) {
        console.error('Error submitting feedback:', error);
        return sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};

// --- Pre-Register API ---
const preRegisterUser = async (req, res) => {
    try {
        const { fullName, email, phone, interest, preferredPlatform, hearAboutUs } = req.body;

        if (!fullName || !email) {
            return sendGeneralResponse(res, false, 'Full name and email are required', 400);
        }

        const newRegistration = new PreRegister({
            fullName,
            email,
            phone,
            interest,
            preferredPlatform,
            hearAboutUs
        });

        await newRegistration.save();

        return sendGeneralResponse(res, true, 'Pre-registration successful', 201, newRegistration);
    } catch (error) {
        console.error('Error in pre-register:', error);
        return sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};

module.exports = {
    submitFeedback,
    preRegisterUser
};
