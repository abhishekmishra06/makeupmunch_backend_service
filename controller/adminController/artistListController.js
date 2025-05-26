const { Booking } = require("../../models/bookingModel");
const { User, Artist } = require("../../models/userModel");
const { sendGeneralResponse } = require("../../utils/responseHelper");
 
const getAllArtistsForAdmin = async (req, res) => {
    try {
        // const artists = await User.Artist.find({ role: 'artist' });
        const artists = await Artist.find({ role: 'artist' });


        const fullArtistInfo = await Promise.all(artists.map(async (artist) => {
             const bookingCount = await Booking.countDocuments({ artist_id: artist._id });



            return {
               

                _id: artist._id,
                businessName: artist.businessName,
                username: artist.username,
                email: artist.email,
                phone: artist.phone,
                city: artist.city,
                specialties: artist.specialties,
                gender: artist.gender,
                profile_img: artist.profile_img,
                availability: artist.availability,
                role: artist.role,
                providedByUs: artist.providedByUs,
                Status:artist.Status,
                isLogin: artist.isLogin ? 'Active' : 'Inactive',
                joinedDate: artist.createdAt,
                bookingCount,
                lastActiveAt: artist.lastActiveAt,

 
            };
        }));

        console.log(fullArtistInfo);
        return sendGeneralResponse(res, false, "Get Artists List Successful", 400, fullArtistInfo);

    } catch (error) {
        console.error('Error fetching artists for admin:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

module.exports = { getAllArtistsForAdmin };
