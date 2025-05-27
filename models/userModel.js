const mongoose = require('mongoose');

// old
// const CustomerRegisterSchema = new mongoose.Schema({
//     username: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     phone: { type: String, required: true },
//     gender: { type: String, required: false },
//     role: { type: String, default: 'customer' },
//     profile_img: { type: String, required: false },
//       fcmToken: { type: String },

//     refreshToken: { type: String },
// }, { timestamps: true, collection: 'users' });

// const Customer = mongoose.model('Customer', CustomerRegisterSchema);

const CustomerRegisterSchema = new mongoose.Schema({

    username: { type: String },
    email: { type: String, required: true },
    password: { type: String },
    phone: { type: String, required: true, unique: true },
    gender: { type: String },
    role: { type: String, required: true, enum: ['customer'], default: 'customer' },
    profile_img: { type: String },
    fcmToken: { type: String },
    refreshToken: { type: String },
    isLogin: { type: Boolean, default: false }, // 👈 NEW
    lastLoginAt: { type: Date },
}, { timestamps: true, collection: 'users' });

const Customer = mongoose.model('Customer', CustomerRegisterSchema);




const AddressSchema = new mongoose.Schema({
    pinCode: { type: String },
    state: { type: String, required: true },
    city: { type: String, required: true },
    street: { type: String, required: true },
    area: { type: String, required: true },
    nearby: { type: String, required: true }
});



const ArtistRegisterSchema = new mongoose.Schema({
    businessName: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    specialties: [{ type: String, required: true }],
    profile_img: { type: String, required: true },
    role: { type: String, required: true ,enum: ['artist'], default: 'artist' },
    fcmToken: { type: String },
    providedByUs: { type: Boolean, default: false },
    isLogin: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    Status: {
        type: String,
        enum: ['pending', 'approved', 'blocked'],
        default: 'approved'
    },

    approvedAt: { type: Date }, // Set when admin approves
    blockedAt: { type: Date },  // Set when admin blocks
    availability: {
        type: String,
        enum: ['day', 'night', 'both'],
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true
    },
    paymentMethods: {
        type: [String],
        enum: ['online', 'cash'],
        required: true
    },
    advanceAmount: {
        type: Number,
        required: true,
        enum: [10, 20, 30, 40, 50],
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
        }
    }
    ,
    about: { type: String }
}, { timestamps: true, collection: 'users' });

const Artist = mongoose.model('Artist', ArtistRegisterSchema);
module.exports = Artist;

 


const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    gender: { type: String, required: true },
    role: { type: String, enum: ['customer', 'artist'], default: 'customer' },
    profile_img: { type: String },
    refreshToken: { type: String },
    fcmToken: { type: String },
     isLogin: { type: Boolean, default: false }, // 👈 NEW
    lastLoginAt: { type: Date },
}, { timestamps: true, collection: 'users' });

const User = mongoose.model('User', UserSchema);



const salonSchema = new mongoose.Schema({
    businessName: { type: String, required: true },
    username: { type: String, required: true, },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, required: true },
    city: { type: String, required: true },
    profile_img: { type: String },
    numberOfArtists: { type: Number, required: true },
    refreshToken: { type: String },
}, { timestamps: true });

const Salon = mongoose.model('Salon', salonSchema);





const ServiceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    services: [{
        serviceName: {
            type: String,
            required: true
        },
        subServices: [
            {
                name: {
                    type: String,
                    required: true
                },
                price: {
                    type: Number,
                    required: true
                }
            }
        ]
    }]
}, { timestamps: true, collection: 'ArtistServices' });

ServiceSchema.index({ userId: 1, 'services.serviceName': 1 }, { unique: true });

const Service = mongoose.model('Services', ServiceSchema);

module.exports = Service;



module.exports = { Artist, Customer, User, Service, Salon };
