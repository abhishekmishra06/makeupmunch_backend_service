


const { sendGeneralResponse } = require("../utils/responseHelper");
const {   User }  = require("../models/userModel");const Favorite = require('../models/favoriteModel');  
const { validateServicesFormat } = require("../utils/validation");



const artistList = async (req, res) => {
     const { customer_id } = req.body;


 
    try {
        console.log("Fetching artist list...");
        
         const artists = await User.find({ role: 'artist' }).select('username email role _id address phone profile_img');

        // Handle case when no artists are found
        if (!artists || artists.length === 0) {
            return sendGeneralResponse(res, false, 'No artists found', 404);
        }

        // Fetch the list of favorite artists for the customer
        const favoriteArtists = await Favorite.find({ customer_id, favorite_type: 'artist' }).select('favorite_id');

        // Convert the favoriteArtists to an array of artist IDs for easy comparison
        const favoriteArtistIds = favoriteArtists.map(fav => fav.favorite_id.toString());

        // Add `is_favorite` field to each artist based on the favorite list
        const artistsWithFavoriteStatus = artists.map(artist => {
            return {
                ...artist._doc, // Spread the artist object (._doc is used to access the Mongoose document data)
                is_favorite: favoriteArtistIds.includes(artist._id.toString()) // Check if the artist is in the favorite list
            };
        });

        return sendGeneralResponse(res, true, 'Artists retrieved successfully', 200, artistsWithFavoriteStatus);

    } catch (error) {
        console.error('Error fetching artists:', error);
        return sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};



const addArtistServices = async (req, res) => {
    const { services, role, id } = req.body;  

     if (role !== 'artist') {
        return sendGeneralResponse(res, false, 'You must be an artist to add services', 403);
    }

     const validation = validateServicesFormat(res, services, role);
    if (validation) {
        return validation;
    }

    try {
        
         const user = await User.findById(id);

        if (!user) {
            return sendGeneralResponse(res, false, 'Artist not found', 404);
        }

         if (user.role !== 'artist') {
            return sendGeneralResponse(res, false, 'Access denied. Only artists can add services', 403);
        }

        // If no services exist yet, create an empty array for services
        if (!user.services) {
            user.services = [];
        }

        // Loop through the services and update or add them to the user's profile
        services.forEach(service => {
            // Check if the service already exists
            const existingService = user.services.find(existing => existing.service === service.service);

            if (!existingService) {
                // Add the new service if it doesn't exist
                user.services.push(service);
            } else {
                // Add subservices if the service already exists
                service.subServices.forEach(subService => {
                    const existingSubService = existingService.subServices.find(
                        (sub) => sub._id.toString() === subService._id.toString()
                    );

                    if (!existingSubService) {
                        existingService.subServices.push(subService);
                    }
                });
            }
        });

 
         await User.findByIdAndUpdate(id, {
            $set: { services: user.services }   
        });
 

         return sendGeneralResponse(res, true, 'Services added successfully', 200, user);
    } catch (error) {
        console.error('Error adding services:', error);
        return sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};

 





const deleteArtistServices = async (req, res) => {
    const { serviceId, subServiceId, role, userId } = req.body;
  
    // Check if the role is 'Artist'
    if (role !== 'artist') {
      return sendGeneralResponse(res, false, 'You must be an artist to delete services', 403);
    }
  
    try {
      // Fetch the user profile (we're fetching to check if user exists)
      const user = await User.findById(userId);
  
      if (!user) {
        return sendGeneralResponse(res, false, 'Artist not found', 404);
      }
  
      // If subServiceId is provided, delete the subservice
      if (subServiceId) {
        const result = await User.findByIdAndUpdate(
          userId,
          {
            $pull: { 'services.$[service].subServices': { _id: subServiceId } },
          },
          {
            arrayFilters: [{ 'service._id': serviceId }],  // Find the specific service
            new: true, // Return the updated user object (optional)
          }
        );
  
        // If no service/subservice was deleted
        if (!result) {
          return sendGeneralResponse(res, false, 'Subservice not found or already deleted', 404);
        }
  
        return sendGeneralResponse(res, true, 'Subservice deleted successfully', 200);
  
      } else {
        // If no subServiceId, delete the entire service
        const result = await User.Artist.findByIdAndUpdate(
          userId,
          {
            $pull: { services: { _id: serviceId } }, // Pull the entire service
          },
          {
            new: true,  // Return the updated user object (optional)
          }
        );
  
        // If no service was deleted
        if (!result) {
          return sendGeneralResponse(res, false, 'Service not found or already deleted', 404);
        }
  
        return sendGeneralResponse(res, true, 'Service deleted successfully', 200);
      }
  
    } catch (error) {
      console.error('Error deleting services:', error);
      return sendGeneralResponse(res, false, 'Internal server error', 500);
    }
  };
  


module.exports = { artistList , addArtistServices , deleteArtistServices };
