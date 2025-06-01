const Consultation = require('../models/consultationModel');
const sendEmail = require('../utils/sendEmail');

// Create a new consultation request
const createConsultation = async (req, res) => {
  try {
    const { name, phone, email, city, eventDate, serviceType, message } = req.body;

    // Validate required fields
    if (!name || !phone || !city || !serviceType) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, city, and service type are required fields'
      });
    }

    // Check for duplicate consultation with same phone number within last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingConsultation = await Consultation.findOne({
      phone: phone,
      createdAt: { $gte: twentyFourHoursAgo }
    });

    if (existingConsultation) {
      return res.status(409).json({
        success: false,
        message: 'A consultation request with this phone number already exists within the last 24 hours'
      });
    }

    // Create new consultation
    const consultation = new Consultation({
      name,
      phone,
      email,
      city,
      eventDate: eventDate ? new Date(eventDate) : undefined,
      serviceType,
      message
    });

    await consultation.save();

    // Send confirmation email to customer (if email provided)
    if (email) {
      try {
        await sendEmail({
          to: email,
          subject: 'Free Consultation Request Received - MakeupMunch',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #e91e63;">Thank you for your consultation request!</h2>
              <p>Dear ${name},</p>
              <p>We have received your free consultation request and our team will contact you within 24 hours.</p>
              
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">Your Request Details:</h3>
                <p><strong>Service:</strong> ${serviceType}</p>
                <p><strong>City:</strong> ${city}</p>
                ${eventDate ? `<p><strong>Event Date:</strong> ${new Date(eventDate).toLocaleDateString()}</p>` : ''}
                ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
              </div>
              
              <p>Our expert makeup artists will provide you with personalized recommendations for your special day!</p>
              
              <div style="background-color: #e91e63; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <p style="margin: 0;"><strong>📞 Contact us:</strong> +91-6386444795</p>
                <p style="margin: 0;"><strong>🌐 Visit:</strong> www.makeupmunch.in</p>
              </div>
              
              <p>Best regards,<br>Team MakeupMunch</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Send notification to admin/team
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@makeupmunch.in',
        subject: 'New Free Consultation Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e91e63;">New Consultation Request</h2>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
              <h3 style="color: #333; margin-top: 0;">Customer Details:</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              ${email ? `<p><strong>Email:</strong> ${email}</p>` : ''}
              <p><strong>City:</strong> ${city}</p>
              <p><strong>Service Type:</strong> ${serviceType}</p>
              ${eventDate ? `<p><strong>Event Date:</strong> ${new Date(eventDate).toLocaleDateString()}</p>` : ''}
              ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
              <p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p style="color: #e91e63; font-weight: bold;">Please contact the customer within 24 hours!</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Admin email sending failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Consultation request submitted successfully! We will contact you within 24 hours.',
      data: {
        id: consultation._id,
        name: consultation.name,
        serviceType: consultation.serviceType,
        city: consultation.city,
        status: consultation.status
      }
    });

  } catch (error) {
    console.error('Error creating consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};

// Get all consultations (for admin)
const getAllConsultations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, city, serviceType } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (city) filter.city = city;
    if (serviceType) filter.serviceType = serviceType;

    const consultations = await Consultation.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Consultation.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: consultations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get consultation by ID
const getConsultationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const consultation = await Consultation.findById(id);
    
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: consultation
    });

  } catch (error) {
    console.error('Error fetching consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update consultation status
const updateConsultationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['pending', 'contacted', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const updateData = { status };
    if (notes) updateData.notes = notes;
    if (status === 'contacted') updateData.contactedAt = new Date();

    const consultation = await Consultation.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Consultation status updated successfully',
      data: consultation
    });

  } catch (error) {
    console.error('Error updating consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createConsultation,
  getAllConsultations,
  getConsultationById,
  updateConsultationStatus
}; 