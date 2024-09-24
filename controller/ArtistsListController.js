


const { sendGeneralResponse } = require("../utils/responseHelper");
const User = require('../models/userModel');
const Favorite = require('../models/favoriteModel');  


// previous code 

// const artistList = async (req, res) => {
//     try {
//         console.log("api is fetching");
        
//         // Fetch users with role 'artist'
//          const artists = await User.find({ role: 'artist' }).select('username email role _id address phone profile_img');

//         // Handle case when no artists are found
//         if (!artists || artists.length === 0) {
//             return sendGeneralResponse(res, false, 'No artists found', 404);
//         }
//         return sendGeneralResponse(res, true, 'Artists retrieved successfully', 200, artists);

//     } catch (error) {
//         console.error('Error fetching artists:', error);
//         return sendGeneralResponse(res, false, 'Internal server error', 500);
//     }
// };

// module.exports = { artistList };


 

const artistList = async (req, res) => {
    // const customer_id = req._id;  
    const { customer_id } = req.body;


 
    try {
        console.log("Fetching artist list...");
        
        // Fetch users with role 'artist'
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

module.exports = { artistList };
