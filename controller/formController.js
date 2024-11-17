const FormModel = require('../models/FormModel');

const formController = {
  createSubmission: async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      
      const existingSubmission = await FormModel.findOne({ phoneNumber });
      
      if (existingSubmission) {
        return res.status(200).json({
          success: true,
          message: 'Phone number already registered',
          data: existingSubmission
        });
      }

      const newSubmission = new FormModel({
        phoneNumber
      });

      const savedSubmission = await newSubmission.save();
      
      res.status(201).json({
        success: true,
        message: 'New submission created successfully',
        data: savedSubmission
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  // सभी submissions को get करने के लिए
  getAllSubmissions: async (req, res) => {
    try {
      const submissions = await FormModel.find().sort({ createdAt: -1 });
      
      res.status(200).json({
        success: true,
        data: submissions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Phone number से specific submission को get करने के लिए
  getSubmissionByPhone: async (req, res) => {
    try {
      const { phoneNumber } = req.params;
      
      const submission = await FormModel.findOne({ phoneNumber });
      
      if (!submission) {
        return res.status(404).json({
          success: false,
          error: 'Submission not found'
        });
      }

      res.status(200).json({
        success: true,
        data: submission
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = { formController }; 