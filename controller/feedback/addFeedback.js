const express = require('express');
const Feedback = require('../../models/feedbackModel');  
const User = require('../../models/userModel');  

const addFeedback = async (req, res) => {
    const { user_id, feedback_for_id, stars, comment } = req.body;

    // Ensure user_id and feedback_for_id are provided
    if (!user_id || !feedback_for_id) {
        return res.status(400).json({ success: false, message: 'User ID and Feedback For ID are required' });
    }

    // Ensure at least one of stars or comment is provided
    if (!stars && !comment) {
        return res.status(400).json({ success: false, message: 'Either a star rating or a comment is required' });
    }

    // If stars are provided, ensure it's between 1 and 5
    if (stars && (stars < 1 || stars > 5)) {
        return res.status(400).json({ success: false, message: 'Star rating must be between 1 and 5' });
    }

    try {
        // Verify the user providing feedback exists
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify the artist or salon receiving feedback exists
        const feedbackFor = await User.findById(feedback_for_id);
        if (!feedbackFor) {
            return res.status(404).json({ success: false, message: 'Artist or Salon not found' });
        }

        // Save the feedback
        const feedback = new Feedback({ user_id, feedback_for_id, stars, comment });
        await feedback.save();

        res.status(201).json({ success: true, message: 'Feedback submitted successfully', data: feedback });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = { addFeedback };
