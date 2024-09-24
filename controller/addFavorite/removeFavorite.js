

const Favorite = require('../../models/favoriteModel'); // 
const User = require('../../models/userModel'); 



const removeFavorite = async (req, res) => {
    const { customer_id, favorite_type, favorite_id } = req.body;

    if (!customer_id || !favorite_type || !favorite_id) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Validate favorite_type to be either 'artist' or 'salon'
    if (!['artist', 'salon'].includes(favorite_type)) {
        return res.status(400).json({ success: false, message: 'Invalid favorite type' });
    }

    try {
        // Find the favorite entry in the database
        const favorite = await Favorite.findOneAndDelete({ customer_id, favorite_type, favorite_id });

        if (!favorite) {
            return res.status(404).json({ success: false, message: 'Favorite not found' });
        }

        return res.status(200).json({ success: true, message: 'Removed from favorites successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = { removeFavorite };
