// const mongoose = require('mongoose');

// const serviceSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     type: { type: String, required: true },
//     description: { type: String },
//     price: { type: Number, required: true },
//     duration: { type: String },
//     createdAt: { type: Date, default: Date.now },
// });

// const Service = mongoose.model('Service', serviceSchema);

// module.exports = Service;




const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    services: { type: String, required: true },  
    subServices: [{ type: String, required: true }] 
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
