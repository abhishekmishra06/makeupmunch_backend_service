const { Artist } = require("../../../models/userModel");
const { sendGeneralResponse } = require("../../../utils/responseHelper");
const { uploadImage } = require("../../../utils/uploadImages");

const uploadArtistImages = async (req, res) => {
    // if (!req.body || !req.file) {
    //     return sendGeneralResponse(res, false, 'Request body or image file is missing', 400);
    // }

    const { artistId } = req.body;

    if (!artistId) {
        return sendGeneralResponse(res, false, 'Artist ID is required', 400);
    }


    
    // const existingUser = await User.Artist.findOne({ email });

    try {
        const artist = await Artist.findById(artistId);
        if (!artist) {
            return sendGeneralResponse(res, false, 'Artist not found', 404);
        }

        // Handle multiple files
        const imageUploadPromises = req.files.map(file => uploadImage(file.buffer, 'artist_img_' + Date.now()));
        const uploadedImages = await Promise.all(imageUploadPromises);
        
        // Assuming artist has an 'images' field to store uploaded images
        artist.images = artist.images ? [...artist.images, ...uploadedImages] : uploadedImages;
        await artist.save();

        sendGeneralResponse(res, true, 'Images uploaded successfully', 200, {
            images: artist.images,
        });
    } catch (error) {
        console.error('Image upload error:', error);
        sendGeneralResponse(res, false, 'Internal server error', 500);
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

