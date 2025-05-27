 const Favorite = require('../../models/favoriteModel'); // 
const User = require('../../models//userModel'); 


const addFavorite = async (req, res) => {
    const { customer_id, favorite_type, favorite_id } = req.body;

    if (!customer_id || !favorite_type || !favorite_id) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Validate favorite_type to be either 'artist' or 'salon'
    if (!['artist', 'salon'].includes(favorite_type)) {
        return res.status(400).json({ success: false, message: 'Invalid favorite type' });
    }

    try {
        // Check if favorite_id is a valid artist/salon
        const user = await User.Customer.findById(favorite_id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Artist or Salon not found' });
        }

        // Check if already favorited
        const existingFavorite = await Favorite.findOne({ customer_id, favorite_type, favorite_id });
        if (existingFavorite) {
            return res.status(400).json({ success: false, message: 'Already added to favorites' });
        }

        // Add to favorites
        const favorite = new Favorite({ customer_id, favorite_type, favorite_id });
        await favorite.save();

        res.status(201).json({ success: true, message: 'Added to favorites successfully', data: favorite });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = { addFavorite };
