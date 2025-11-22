const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    user_info: {
        user_Fname: { type: String, required: true },  
        user_Lname: { type: String,  },
        phoneNumber: { type: Number, required: true }, 
        address: {
            street: { type: String, required: true},  
            area: { type: String, required: true },  
            pincode: {type: Number, required: true},
            city: {type: String, required: true},
            landmark: { type: String }
        }
    },

    service_details: [{
        service_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Services', required: true },
        serviceName: { type: String, required: true },
        selected_services: [{
            subService_name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, default: 1 }
        }],
        total_persons: { type: Number, default: 1 },
        special_requirements: { type: String }
    }],

    artist_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
    booking_date: { type: Date, required: true },
    booking_time: { type: String, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },

    payment: {
        base_amount: { type: Number, required: true },
        additional_charges: { type: Number, default: 0 },
        total_amount: { type: Number, required: true },
        payment_method: { type: String, enum: ['online', 'cash'], required: true }, 
        payment_status: { type: String, enum: ['paid', 'pending', 'failed'], default: 'pending' }, 
        transaction_id: { type: String },
        payment_date: { type: Date },
        razorpay_payment_id: { type: String },
        booking_id: { type: String, required: true }
    },

    cancellation: {
        cancelled_by: { type: String, enum: ['user', 'artist'] },
        cancellation_reason: { type: String },
        cancellation_date: { type: Date },
        cancellation_fee: { type: Number, default: 0 },
        refund_amount: { type: Number, default: 0 },
        cancellation_status: { type: String, enum: ['pending', 'processed', 'refunded'], default: 'pending' }
    } 
}, { timestamps: true });

const packageBookingSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    user_info: {
        user_Fname: { type: String, required: true },
        user_Lname: { type: String,  },
        phoneNumber: { type: Number, required: true },
        address: {
            street: { type: String, required: true },
            area: { type: String, required: true },
            pincode: { type: Number, required: true },
            city: { type: String, required: true },
            landmark: String
        }
    },
    package_details: {
        // Support for single package (backward compatibility)
        package_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Package'
        },
        package_name: { type: String },
        package_price: { type: Number },
        // Support for multiple packages
        packages: [{
            package_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Package',
                required: true
            },
            package_name: { type: String, required: true },
            package_price: { type: Number, required: true },
            total_persons: { type: Number, default: 1 }
        }],
        total_persons: { type: Number, default: 1 },
        special_notes: String
    },
    booking_date: { type: Date, required: true },
    booking_time: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    payment: {
        // Base amount (package price * total_persons)
        base_amount: { type: Number, required: true },
        // Platform charge
        platform_charge: { type: Number, default: 0 },
        // Venue/Service charge
        venue_charge: { type: Number, default: 0 },
        // Total amount (base_amount + platform_charge + venue_charge)
        total_amount: { type: Number, required: true },
        // Amount in paise for Razorpay
        amount: { type: Number, required: true },
        // Backward compatibility - keep package_price for old records
        package_price: { type: Number },
        payment_method: {
            type: String,
            enum: ['online', 'cash'],
            required: true
        },
        payment_status: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending'
        },
        booking_id: { type: String, required: true },
        razorpay_order_id: String,
        razorpay_payment_id: String,
        razorpay_signature: String
    },
    cancellation: {
        cancelled_by: { type: String, enum: ['user', 'artist'] },
        cancellation_reason: { type: String },
        cancellation_date: { type: Date },
        cancellation_fee: { type: Number, default: 0 },
        refund_amount: { type: Number, default: 0 },
        cancellation_status: { type: String, enum: ['pending', 'processed', 'refunded'], default: 'pending' }
    }
}, { timestamps: true });

module.exports = {
    Booking: mongoose.model('Booking', bookingSchema),
    PackageBooking: mongoose.model('PackageBooking', packageBookingSchema)
};