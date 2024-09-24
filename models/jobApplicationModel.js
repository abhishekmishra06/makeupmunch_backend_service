const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
    name: { type: String, required: true },  // Applicant's name
    email: { type: String, required: true },  // Applicant's email
    resume: { type: String, required: true },  // Link or path to the resume file
    phone: { type: String, required: true },  // Applicant's phone number
    coverLetter: { type: String },  // Optional cover letter
    jobTitle: { type: String, required: true },  // Title of the job being applied for
    appliedAt: { type: Date, default: Date.now }  // Timestamp of application
});

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
