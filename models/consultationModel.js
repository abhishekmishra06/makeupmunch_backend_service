const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  city: {
    type: String,
    required: true,
    enum: ['Delhi', 'Gurgaon', 'Lucknow', 'Mumbai', 'Bangalore', 'Other']
  },
  eventDate: {
    type: Date
  },
  serviceType: {
    type: String,
    required: true,
    enum: [
      'Bridal Makeup',
      'Engagement Makeup', 
      'Reception Makeup',
      'HD Makeup',
      'Airbrush Makeup',
      'Family Makeup',
      'Hair Styling',
      'Full Wedding Package'
    ],
    default: 'Bridal Makeup'
  },
  message: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'completed', 'cancelled'],
    default: 'pending'
  },
  contactedAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
consultationSchema.index({ phone: 1 });
consultationSchema.index({ email: 1 });
consultationSchema.index({ status: 1 });
consultationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Consultation', consultationSchema); 