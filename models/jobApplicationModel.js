const mongoose = require('mongoose');
 
const jobApplicationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    resume: { type: String, required: true },
    phone: { type: String, required: true },
    coverLetter: { type: String },
    jobTitle: { type: String, required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    appliedAt: { type: Date, default: Date.now }
});

// Ensure that a user cannot apply to the same job more than once
jobApplicationSchema.index({ email: 1, jobId: 1 }, { unique: true });

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

 


 
const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    requirements: {
        type: String,
        required: true,
    },
    skills: {   
        type: [String], 
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

 


const Job = mongoose.model('Job', jobSchema);
module.exports = {Job, JobApplication};
