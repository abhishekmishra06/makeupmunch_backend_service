const express = require('express');
const Rating = require('../../models/ratingModel');  
const User = require('../../models/userModel');  // To verify if the artist/salon exists

const getRatings = async (req, res) => {
    const { rated_id } = req.params;

    if (!rated_id) {
        return res.status(400).json({ success: false, message: 'rated_id is required' });
    }

    try {
        // Check if rated_id is a valid artist or salon
        const user = await User.findById(rated_id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Artist or Salon not found' });
        }

        // Fetch all ratings for this rated_id (artist or salon)
        const ratings = await Rating.find({ rated_id });

        // If no ratings are found
        if (!ratings || ratings.length === 0) {
            return res.status(404).json({ success: false, message: 'No ratings found for this user' });
        }

        // Return the ratings
        return res.status(200).json({
            success: true,
            message: 'Ratings retrieved successfully',
            data: ratings
        });
    } catch (error) {
        console.error('Error fetching ratings:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = { getRatings };
