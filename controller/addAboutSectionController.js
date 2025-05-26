const {  Artist } = require("../models/userModel");
const { sendGeneralResponse } = require("../utils/responseHelper");

const addOrUpdateAboutSection = async (req, res) => {
    const { userId, about } = req.body;
  
    if (!userId || !about) {
      return sendGeneralResponse(res, false, 'userId and about are required', 400);
    }
  
    try {
      // Find the salon by ID
      const artist = await Artist.findById(userId);
  
      if (!artist) {
        return sendGeneralResponse(res, false, 'Salon not found', 404);
      }
  
      // Update the about section if it exists, otherwise add it
      artist.about = about; // Update the about section
      await artist.save();
  
      sendGeneralResponse(res, true, 'About section updated successfully', 200, {
        _id: artist._id,
        businessName: artist.businessName,
        about: artist.about,
      });
    } catch (error) {
      console.error('Error updating about section:', error);
      sendGeneralResponse(res, false, 'Internal server error', 500);
    }  
  };
  

 
module.exports = {addOrUpdateAboutSection} ;
