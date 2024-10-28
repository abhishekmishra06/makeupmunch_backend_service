const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    user_info: {
        user_Fname: { type: String, required: true },  
        user_Lname: { type: String, required: true },
        phoneNumber: { type: Number, required: true }, 
        nearby: { type: String,  required: true }, 
        street: { type: String, required: true},  
        area: { type: String, required: true },  
        pincode: {type: Number, required: true},
        city : {type: String, required: true},
    },

    service_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    provider_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    booking_date: { type: Date, required: true },
    status: { type: String, enum: ['confirmed', 'completed', 'cancelled', 'pending'], required: true },
    payment: {
        amount: { type: Number, required: true },  
        currency: { type: String, required: true },
        payment_method: { type: String, enum: ['credit_card', 'paypal', 'bank_transfer'], required: true }, 
        payment_status: { type: String, enum: ['paid', 'pending', 'failed'], required: true }, 
        transaction_id: { type: String , required: true},  
        payment_date: { type: Date, required: true },  
        payment_id: {type: String, required: true},
        booking_id : {type: String, required: true},
    },
    details: {additional_info: { type: String }}
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);