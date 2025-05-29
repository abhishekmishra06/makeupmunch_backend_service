const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads an image to Cloudinary.
 * @param {Buffer} fileBuffer 
 * @param {Buffer} imageBuffer - The image file buffer.
 * @param {string} publicId - Optional public ID for the image. 
 * @param {string} resourceType 
 * @returns {Promise<string>} - The URL of the uploaded image.
 */

const uploadImage = async (imageBuffer, publicId) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { public_id: publicId, resource_type: 'image' },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result.secure_url);
            }
        ).end(imageBuffer);
    });
};



const uploadFile = async (fileBuffer, publicId, resourceType) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { public_id: publicId, resource_type: resourceType },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result.secure_url);
            }
        ).end(fileBuffer);
    });
};

module.exports = { uploadImage, uploadFile };
