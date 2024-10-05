


const mongoose = require('mongoose');



// const AddressSchema = new mongoose.Schema({
//     pinCode: { type: String, required: true },
//     state: { type: String, required: true },
//     city: { type: String, required: true },
//     street: { type: String, required: true },
//     area: { type: String, required: true },
//     nearby: { type: String, required: true }
// });

 
// module.exports = User




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
 


const SubServiceSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },    
    price: { type: Number, required: true, min: 0.01 }    
});


 const ServiceSchema = new mongoose.Schema({
    service: { type: String, required: true },  
    subServices: [SubServiceSchema]             
});

 const AddressSchema = new mongoose.Schema({
    pinCode: { type: String },
    state: { type: String, required: true },
    city: { type: String, required: true },
    street: { type: String, required: true },
    area: { type: String, required: true },
    nearby: { type: String, required: true }
});
// const ArtistRegisterSchema = new mongoose.Schema({
//     username: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     dob: { type: Date, required: true },
//     address: { type: AddressSchema, required: true },
//     phone: { type: String, required: true },
//     gender: { type: String, required: true },
//     role: { type: String, default: 'artist' }, // Default to 'artist'
//     paymentMethod: { type: String, required: true },
//     services: [ServiceSchema],                 // Array of services
//     specialties: [{ type: String, required: true }], // Specialties array
//     advanceBookingAmount: { type: Number, required: true },
//     profileImage: { type: String },             // Optional image URL or file
//     refreshToken: { type: String } ,
//     profile_img: { type: String }      
// }, { timestamps: true, collection: 'users' });

// const Artist = mongoose.model('Artist', ArtistRegisterSchema);
// module.exports = Artist;


const ArtistRegisterSchema = new mongoose.Schema({
    businessName: { type: String, required: true },  
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true }, 
    specialties: [{ type: String, required: true }],
    profile_img: { type: String,  required: true},
     role: { type: String,  required: true},

}, { timestamps: true, collection: 'users' });

const Artist = mongoose.model('Artist', ArtistRegisterSchema);
module.exports = Artist;




const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dob: { type: Date, required: true },
    address: { type: AddressSchema, required: true },
    phone: { type: String, required: true },
    gender: { type: String, required: true },
    role: { type: String, enum: ['customer', 'artist'], default: 'customer' }, // 'customer' or 'artist'
    profile_img: { type: String },  
    services: [ServiceSchema], 
    refreshToken: { type: String },
}, { timestamps: true, collection: 'users' });

const User = mongoose.model('User', UserSchema);


module.exports = {Artist, Customer , User};
 