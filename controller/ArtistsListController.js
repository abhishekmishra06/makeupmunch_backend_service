


const { sendGeneralResponse } = require("../utils/responseHelper");
const {   User, Service }  = require("../models/userModel");
const Favorite = require('../models/favoriteModel');  
const { validateServicesFormat } = require("../utils/validation");
 


const artistList = async (req, res) => {
     const { customer_id } = req.body;
    try {
        console.log("Fetching artist list...");
        
         const artists = await User.find({ role: 'artist' }).select('username email role _id address phone profile_img');

         if (!artists || artists.length === 0) {
            return sendGeneralResponse(res, false, 'No artists found', 404);
        }

         const favoriteArtists = await Favorite.find({ customer_id, favorite_type: 'artist' }).select('favorite_id');

         const favoriteArtistIds = favoriteArtists.map(fav => fav.favorite_id.toString());

         const artistsWithFavoriteStatus = artists.map(artist => {
            return {
                ...artist._doc,  
                is_favorite: favoriteArtistIds.includes(artist._id.toString()) 
            };
        });

        return sendGeneralResponse(res, true, 'Artists retrieved successfully', 200, artistsWithFavoriteStatus);

    } catch (error) {
        console.error('Error fetching artists:', error);
        return sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};





const addArtistServices = async (req, res) => {
  const { role, id, services } = req.body;

  if (role !== 'artist') {
    return sendGeneralResponse(res, false, 'You must be an artist to add services', 403);
  }

  console.log("Received services:", services);

  try {
    const user = await User.findById(id);
    if (!user) {
      return sendGeneralResponse(res, false, 'Artist not found', 404);
    }

    if (user.role !== 'artist') {
      return sendGeneralResponse(res, false, 'Access denied. Only artists can add services', 403);
    }

    let existingServices = await Service.findOne({ userId: user._id });

    if (existingServices) {
      if (!Array.isArray(existingServices.services)) {
        existingServices.services = [];
      } 

      services.forEach(service => {
        const { serviceName, subServices } = service;

        let existingService = existingServices.services.find(s => s.serviceName === serviceName);

        if (existingService) {
          subServices.forEach(subService => {
            const existingSubService = existingService.subServices.find(sub => sub.name === subService.name);

            if (!existingSubService) {
              existingService.subServices.push({
                name: subService.name,
                price: subService.price
              });
            } else {
              existingSubService.price = subService.price;
            }
          });
        } else {
          existingServices.services.push({
            serviceName: serviceName,
            subServices: subServices.map(subService => ({
              name: subService.name,
              price: subService.price
            }))
          });
        }
      });

      await existingServices.save();
      return sendGeneralResponse(res, true, 'Services updated successfully', 200, { services: existingServices.services });
    } else {
      const newServiceDocument = new Service({
        userId: user._id,
        services: services.map(service => ({
          serviceName: service.serviceName,
          subServices: service.subServices.map(subService => ({
            name: subService.name,
            price: subService.price
          }))
        }))
      });

      console.log("Saving new service document:", newServiceDocument);

      await newServiceDocument.save();
      return sendGeneralResponse(res, true, 'Services added successfully', 200, { services: newServiceDocument.services });
    }
  } catch (error) {
    console.error('Error adding services:', error);
    return sendGeneralResponse(res, false, 'Internal server error', 500);
  }
};


const getArtistServices = async (req, res) => {
  const { id } = req.params; // Assuming you'll pass the artist's ID as a URL parameter

  try {
    const user = await User.findById(id);
    if (!user) {
      return sendGeneralResponse(res, false, 'Artist not found', 404);
    }

    if (user.role !== 'artist') {
      return sendGeneralResponse(res, false, 'Access denied. This user is not an artist', 403);
    }

    const services = await Service.findOne({ userId: user._id });

    if (!services) {
      return sendGeneralResponse(res, true, 'No services found for this artist', 200, { services: [] });
    }

    return sendGeneralResponse(res, true, 'Services retrieved successfully', 200, { services: services.services });
  } catch (error) {
    console.error('Error retrieving services:', error);
    return sendGeneralResponse(res, false, 'Internal server error', 500);
  }
};




const deleteArtistService = async (req, res) => {
  const { role, id, serviceName, subServiceName } = req.body;

  if (role !== 'artist') {
    return sendGeneralResponse(res, false, 'You must be an artist to delete services', 403);
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return sendGeneralResponse(res, false, 'Artist not found', 404);
    }

    if (user.role !== 'artist') {
      return sendGeneralResponse(res, false, 'Access denied. Only artists can delete services', 403);
    }

    let existingServices = await Service.findOne({ userId: user._id });

    if (!existingServices) {
      return sendGeneralResponse(res, false, 'No services found for this artist', 404);
    }

    const serviceIndex = existingServices.services.findIndex(s => s.serviceName === serviceName);

    if (serviceIndex === -1) {
      return sendGeneralResponse(res, false, 'Service not found', 404);
    }

    const subServiceIndex = existingServices.services[serviceIndex].subServices.findIndex(sub => sub.name === subServiceName);

    if (subServiceIndex === -1) {
      return sendGeneralResponse(res, false, 'Subservice not found', 404);
    }

    existingServices.services[serviceIndex].subServices.splice(subServiceIndex, 1);

    // If no more subservices, remove the entire service
    if (existingServices.services[serviceIndex].subServices.length === 0) {
      existingServices.services.splice(serviceIndex, 1);
    }

    await existingServices.save();

    return sendGeneralResponse(res, true, 'Subservice deleted successfully', 200, { services: existingServices.services });
  } catch (error) {
    console.error('Error deleting subservice:', error);
    return sendGeneralResponse(res, false, 'Internal server error', 500);
  }
};
   

module.exports = { artistList , addArtistServices , deleteArtistService , getArtistServices };
