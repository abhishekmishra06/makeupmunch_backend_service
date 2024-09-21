


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dob: {
        type: Date,       
        required: true
    },
    address: {
        type: String,   
        required: true
    },
    phone: {
        type: String,     
        required: true
    },
    gender: {
        type: String,    
        required: true,
        enum: ['Male', 'Female', 'Other']  
    },
    role: {
        type: String,   
        required: true,
        enum: ['costumer', 'artist', 'beauty_parlor','admin'
        ]  

    },
    isverify: {
        type: Boolean,     
        required: true,
        default: false
    },
    profile_img: { type: String ,  required: true,},
    refreshToken: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema)