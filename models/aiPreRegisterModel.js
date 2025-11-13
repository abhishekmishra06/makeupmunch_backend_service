const mongoose = require('mongoose');

const preRegisterSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    interest: { type: String, trim: true },
    preferredPlatform: { type: String, trim: true }, // e.g., Web, Mobile, Both
    hearAboutUs: { type: String, trim: true }, // where they heard about the campaign
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AnupurnaPreRegister', preRegisterSchema);
