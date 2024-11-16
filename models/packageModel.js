const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  services: [{
    type: String,
    required: true,
  }],
}, {
  timestamps: true
});

const Package = mongoose.model('Package', packageSchema);
module.exports = Package;