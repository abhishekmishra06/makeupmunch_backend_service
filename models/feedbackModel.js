const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // User providing the feedback
    feedback_for_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Artist/Salon the feedback is for
    stars: { type: Number, min: 1, max: 5 },  // Optional star rating, between 1 and 5
    comment: { type: String },  // Optional comment for feedback
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
