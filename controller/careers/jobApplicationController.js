const express = require('express');
 const { sendGeneralResponse } = require('../../utils/responseHelper');
const { validateEmail } = require('../../utils/validation');
const Job = require('../../models/jobApplicationModel');  
const { uploadImage, uploadFile } = require('../../utils/uploadImages');




const applyForJob = async (req, res) => {
    const { name, email, phone, coverLetter, jobId } = req.body;  
    const resumeFile = req.file;

    if (!name || !email || !resumeFile  || !phone || !jobId) {
        return sendGeneralResponse(res, false, 'All fields are required', 400);
    }

    if (!validateEmail(email)) {
        return sendGeneralResponse(res, false, 'Invalid email', 400);
    } 


    if (!req.file) {
                return sendGeneralResponse(res, false, 'Resume is required', 400);
            }

    try {
        // Check if the job exists
        const job = await Job.Job.findById(jobId);
        if (!job) {
            return sendGeneralResponse(res, false, 'Job not found', 404);
        }


        const existingApplication = await Job.JobApplication.findOne({ email, jobId });
        if (existingApplication) {
            return sendGeneralResponse(res, false, 'You have already applied for this job', 409);
        }

        const fileExtension = resumeFile.originalname.split('.').pop().toLowerCase();
        const allowedExtensions = ['pdf', 'doc', 'docx', 'txt']; 

        if (!allowedExtensions.includes(fileExtension)) {
            return sendGeneralResponse(res, false, 'Invalid file type. Allowed types: PDF, DOC, DOCX, TXT.', 400);
        }

        const resourceType = fileExtension === 'pdf' ? 'raw' : 'raw';  

 
        const resumeUrl = await uploadFile(resumeFile.buffer, `resumes/${name}-${jobId}`, resourceType);

 

        // Create a new job application
        const application = new Job.JobApplication({
            name,
            email,
            resume: resumeUrl, 
            phone,
            coverLetter,
            jobTitle: job.title,
            jobId  
        });

         await application.save();

        return sendGeneralResponse(res, true, 'Job application submitted successfully', 201, application);

    } catch (error) {
        if (error.code === 11000) { // Duplicate key error
            return sendGeneralResponse(res, false, 'You have already applied for this job', 409);
        }
        console.error('Error submitting job application:', error);
        return sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};



const getJobApplications = async (req, res) => {
    try {
        const jobs = await Job.Job.find();  

        if (!jobs || jobs.length === 0) {
            return sendGeneralResponse(res, false, 'No jobs found', 400);

         }

         sendGeneralResponse(res, true, 'Jobs retrieved successfully', 200 , jobs );

     } catch (error) {
        console.error('Error fetching jobs:', error);
 
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

 



module.exports = { applyForJob  , getJobApplications};
 