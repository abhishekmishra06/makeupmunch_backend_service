const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rated_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  
    stars: { type: Number, min: 1, max: 5 },   
    message: { type: String },  
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rating', ratingSchema);
