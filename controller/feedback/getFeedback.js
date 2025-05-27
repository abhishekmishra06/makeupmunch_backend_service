
const express = require('express');
const Feedback = require('../../models/feedbackModel');  
const User = require('../../models/userModel');  

const getFeedback = async (req, res) => {
    const { feedback_for_id } = req.params;

    if (!feedback_for_id) {
        return res.status(400).json({ success: false, message: 'feedback_for_id is required' });
    }

    try {
        // Verify the artist or salon exists
        const feedbackFor = await User.Artist.findById(feedback_for_id);
        if (!feedbackFor) {
            return res.status(404).json({ success: false, message: 'Artist or Salon not found' });
        }

        // Retrieve all feedback for the artist or salon
        const feedbacks = await Feedback.find({ feedback_for_id });

        if (!feedbacks || feedbacks.length === 0) {
            return res.status(404).json({ success: false, message: 'No feedback found for this artist or salon' });
        }

        res.status(200).json({ success: true, message: 'Feedback retrieved successfully', data: feedbacks });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = { getFeedback };
