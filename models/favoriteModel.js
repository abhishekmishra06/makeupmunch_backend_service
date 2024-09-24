const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Assuming 'User' model represents both customers and providers
        required: true
    },
    favorite_type: {
        type: String,
        enum: ['artist', 'salon'], // Indicate if it's an artist or salon
        required: true
    },
    favorite_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,  // Can be an artist's or salon's ObjectId
        refPath: 'favorite_type'  // Dynamic reference to either artist or salon
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Favorite = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorite;
