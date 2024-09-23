const { v2: cloudinary } = require('cloudinary');

// Configuration
cloudinary.config({ 
    cloud_name: 'ddxqvcz2j', 
    api_key: '862636515494291', 
    api_secret: 'Znl4FjD0PoD5yVal7RlGjxi7fxU' // Replace with your actual API secret
});

/**
 * Uploads an image to Cloudinary.
 * @param {Buffer} imageBuffer - The image file buffer.
 * @param {string} publicId - Optional public ID for the image. 
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

module.exports = { uploadImage };
