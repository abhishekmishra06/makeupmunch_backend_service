const { Salon } = require("../models/userModel");
const { sendGeneralResponse } = require("../utils/responseHelper");

const addOrUpdateAboutSection = async (req, res) => {
    const { salonId, about } = req.body;
  
    if (!salonId || !about) {
      return sendGeneralResponse(res, false, 'salonId and about are required', 400);
    }
  
    try {
      // Find the salon by ID
      const salon = await Salon.findById(salonId);
  
      if (!salon) {
        return sendGeneralResponse(res, false, 'Salon not found', 404);
      }
  
      // Update the about section if it exists, otherwise add it
      salon.about = about; // Update the about section
      await salon.save();
  
      sendGeneralResponse(res, true, 'About section updated successfully', 200, {
        _id: salon._id,
        businessName: salon.businessName,
        about: salon.about,
      });
    } catch (error) {
      console.error('Error updating about section:', error);
      sendGeneralResponse(res, false, 'Internal server error', 500);
    }
  };
  

 
module.exports = {addOrUpdateAboutSection} ;
