const mongoose = require('mongoose');

// About Section Schema - Only description
const AboutSchema = new mongoose.Schema({
    artistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist',
        required: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 1000
    }
}, { timestamps: true });

// Experience Schema - Only year, company, description
const ExperienceSchema = new mongoose.Schema({
    artistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist',
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 500
    }
}, { timestamps: true });

// Certification Schema
const CertificationSchema = new mongoose.Schema({
    artistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    issuingOrganization: {
        type: String,
        required: true
    },
    issueDate: {
        type: Date,
        required: true
    },
    expiryDate: {
        type: Date,
        default: null
    },
    credentialId: {
        type: String
    },
    certificateUrl: {
        type: String
    }
}, { timestamps: true });

// Products Schema - Only category and productName (as brand name)
const ProductSchema = new mongoose.Schema({
    artistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist',
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['foundation', 'concealer', 'powder', 'blush', 'eyeshadow', 'mascara', 'lipstick', 'eyeliner', 'bronzer', 'highlighter', 'primer', 'setting_spray', 'brushes', 'other']
    },
    productName: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Create models
const About = mongoose.model('About', AboutSchema);
const Experience = mongoose.model('Experience', ExperienceSchema);
const Certification = mongoose.model('Certification', CertificationSchema);
const Product = mongoose.model('Product', ProductSchema);

module.exports = {
    About,
    Experience,
    Certification,
    Product
}; 