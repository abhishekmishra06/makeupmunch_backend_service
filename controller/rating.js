const express = require('express');
const Rating = require('../models/ratingModel');  
const User = require('../models/userModel');  


const rateUser = async (req, res) => {
    const { customer_id, rated_id, stars, message } = req.body;

    // Ensure customer_id and rated_id are provided
    if (!customer_id || !rated_id) {
        return res.status(400).json({ success: false, message: 'customer_id and rated_id are required' });
    }

    // Ensure at least stars or message is provided
    if (!stars && !message) {
        return res.status(400).json({ success: false, message: 'Either stars or message must be provided' });
    }

    // If stars are provided, ensure they are between 1 and 5
    if (stars && (stars < 1 || stars > 5)) {
        return res.status(400).json({ success: false, message: 'Stars must be between 1 and 5' });
    }

    try { 
        // Check if rated_id is a valid artist or salon 
        const user = await User.findById(rated_id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Artist or Salon not found' });
        }

        // Create a new rating
        const rating = new Rating({
            customer_id,
            rated_id,
            stars: stars || null,  // If stars is not provided, set it to null
            message: message || ''  // If message is not provided, set it to an empty string
        });

        // Save the rating
        await rating.save();

        res.status(201).json({ success: true, message: 'Rating submitted successfully', data: rating });
    } catch (error) {
        console.error('Error saving rating:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = { rateUser };
