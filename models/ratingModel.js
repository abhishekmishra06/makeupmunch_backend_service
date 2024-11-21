const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  reviewee_Id: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  message: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
});

const Rating = mongoose.model('Rating', RatingSchema);

module.exports = Rating