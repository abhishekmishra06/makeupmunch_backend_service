const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    feedback: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    hearAboutUs: { type: String, trim: true }, // e.g. "Instagram", "Friend", "Ad", "Other"
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AnupurnaFeedback', feedbackSchema);
