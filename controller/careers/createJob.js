const express = require('express');
const Job = require('../../models/jobApplicationModel'); 


const createJob = async (req, res) => {
    const { title, description, requirements, skills, location } = req.body;

    if (!title || !description || !requirements || !skills || !location) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        const job = new Job.Job({
            title,
            description,
            requirements,
            skills,  
            location,
        });

        await job.save();

        res.status(201).json({ success: true, message: 'Job created successfully', data: job });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};








const updateJob = async (req, res) => {
    const { jobId } = req.params;  
    const { title, description, requirements, skills, location } = req.body;

     if (!title && !description && !requirements && !skills && !location) {
        return res.status(400).json({ success: false, message: 'At least one field is required for update' });
    }

    try {
        // Find the job by ID and update it
        const updatedJob = await Job.Job.findByIdAndUpdate(
            jobId,
            { title, description, requirements, skills, location },
            { new: true, runValidators: true } // Return the updated document and run validators
        );

        if (!updatedJob) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        res.status(200).json({ success: true, message: 'Job updated successfully', data: updatedJob });
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};




const deleteJob = async (req, res) => {
    const { jobId } = req.params; 

    try {
        const deletedJob = await Job.Job.findByIdAndDelete(jobId);

        if (!deletedJob) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        res.status(200).json({ success: true, message: 'Job deleted successfully', data: deletedJob });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};




module.exports = {createJob , deleteJob ,updateJob}

