


const mongoose = require('mongoose');



const CustomerRegisterSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dob: { type: Date, required: true },
    address: {
        pinCode: { type: String, required: true },
        state: { type: String, required: true },
        city: { type: String, required: true },
        street: { type: String, required: true },
        area: { type: String, required: true },
        nearby: { type: String, required: true },
    },
    phone: { type: String, required: true },
    gender: { type: String, required: true },
    role: { type: String, default: 'customer' },
    profile_img: { type: String },
    refreshToken: { type: String },
}, { timestamps: true, collection: 'users' });

const Customer = mongoose.model('Customer', CustomerRegisterSchema);
 


 
const ArtistRegisterSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dob: { type: Date, required: true },
    address: {
        pinCode: { type: String, required: true },
        state: { type: String, required: true },
        city: { type: String, required: true },
        street: { type: String, required: true },
        area: { type: String, required: true },
        nearby: { type: String, required: true },
    },
    phone: { type: String, required: true },
    gender: { type: String, required: true },
    role: { type: String, default: 'artist' },
    paymentMethod: { type: String, required: true },
    services: [{
        service: { type: String, required: true }, // Main service name
        subServices: [{
            name: { type: String, required: true }, // Name of the sub-service
            price: { type: Number, required: true } // Price of the sub-service
        }]
    }],
    specialties: [{ type: String, required: true }],
    advanceBookingAmount: { type: Number, required: true },
    profile_img: { type: String },
    refreshToken: { type: String },
}, { timestamps: true, collection: 'users' });

const Artist = mongoose.model('Artist', ArtistRegisterSchema);
module.exports = Artist;

module.exports = {Artist, Customer};
