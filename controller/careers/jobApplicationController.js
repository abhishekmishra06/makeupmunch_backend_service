const express = require('express');
const JobApplication = require('../../models/jobApplicationModel'); // Assuming the schema is in this file

const applyForJob = async (req, res) => {
    const { name, email, resume, phone, coverLetter, jobTitle } = req.body;

     if (!name || !email || !resume || !phone || !jobTitle) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
         const application = new JobApplication({
            name,
            email,
            resume,
            phone,
            coverLetter,
            jobTitle
        });

         await application.save();

        res.status(201).json({ success: true, message: 'Job application submitted successfully', data: application });
    } catch (error) {
        console.error('Error submitting job application:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};




const getJobApplications = async (req, res) => {
    try {
        const applications = await JobApplication.find();
        if (!applications || applications.length === 0) {
            return res.status(404).json({ success: false, message: 'No job applications found' });
        }

        res.status(200).json({ success: true, message: 'Job applications retrieved successfully', data: applications });
    } catch (error) {
        console.error('Error fetching job applications:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

 



module.exports = { applyForJob  , getJobApplications};
 