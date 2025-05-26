const mongoose = require('mongoose');

const singleAddressSchema = new mongoose.Schema({
      _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },

  addressLine: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
   isDefault: { type: Boolean, default: false }
}, { _id: false });

const userAddressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  addresses: [singleAddressSchema]
}, { timestamps: true, collection: 'addresses' });

module.exports = mongoose.model('Address', userAddressSchema);