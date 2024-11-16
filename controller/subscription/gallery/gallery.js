const { Artist } = require("../../../models/userModel");
const { sendGeneralResponse } = require("../../../utils/responseHelper");
const { uploadImage } = require("../../../utils/uploadImages");

const uploadArtistImages = async (req, res) => {
    const { artistId } = req.body;
    const MAX_FILES = 10; // Maximum number of files allowed

    if (!artistId) {
        return sendGeneralResponse(res, false, 'Artist ID is required', 400);
    }

    if (!req.files || req.files.length === 0) {
        return sendGeneralResponse(res, false, 'No images provided', 400);
    }

    if (req.files.length > MAX_FILES) {
        return sendGeneralResponse(res, false, `Maximum ${MAX_FILES} images allowed per upload`, 400);
    }

    try {
        const artist = await Artist.findById(artistId);
        if (!artist) {
            return sendGeneralResponse(res, false, 'Artist not found', 404);
        }

        // Handle multiple files
        const imageUploadPromises = req.files.map(file => uploadImage(file.buffer, `artist_img_${artistId}_${Date.now()}`));
        const uploadedImages = await Promise.all(imageUploadPromises);
        
        // Update artist's images array
        artist.images = artist.images || [];
        artist.images.push(...uploadedImages);
        await artist.save();

        return sendGeneralResponse(res, true, 'Images uploaded successfully', 200, {
            images: artist.images,
        });
    } catch (error) {
        console.error('Image upload error:', error);
        
        // More specific error handling
        if (error.name === 'ValidationError') {
            return sendGeneralResponse(res, false, 'Invalid image data', 400);
        }
        
        return sendGeneralResponse(res, false, 'Failed to upload images', 500);
    }
};




const getArtistImages = async (req, res) => {
    const { artistId } = req.params;

    if (!artistId) {
        return sendGeneralResponse(res, false, 'Artist ID is required', 400);
    }

    try {
        const artist = await User.Artist.findById(artistId);
        if (!artist) {
            return sendGeneralResponse(res, false, 'Artist not found', 404);
        }

        sendGeneralResponse(res, true, 'Images retrieved successfully', 200, {
            images: artist.images || [],
        });
    } catch (error) {
        console.error('Error fetching images:', error);
        sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};



module.exports = { uploadArtistImages, getArtistImages} 

