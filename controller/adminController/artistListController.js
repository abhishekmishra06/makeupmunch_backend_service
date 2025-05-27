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

         return sendGeneralResponse(res, true, "Get Artists List Successful", 200, fullArtistInfo);

    } catch (error) {
        console.error('Error fetching artists for admin:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};





// const approveArtist = async (req, res) => {
//   const { artistId } = req.params;

//   const artist = await Artist.findByIdAndUpdate(
//     artistId,
//     {
//       adminStatus: 'approved',
//       approvedAt: new Date(),
//       blockedAt: null // Clear if previously blocked
//     },
//     { new: true }
//   );

//   if (!artist) {
//     return res.status(404).json({ success: false, message: 'Artist not found' });
//   }

//   res.status(200).json({ success: true, message: 'Artist approved successfully', data: artist });
// };





// const blockArtist = async (req, res) => {
//   const { artistId } = req.params;

//   const artist = await Artist.findByIdAndUpdate(
//     artistId,
//     {
//       adminStatus: 'blocked',
//       blockedAt: new Date(),
//       approvedAt: null // Optional: clear previous approval
//     },
//     { new: true }
//   );

//   if (!artist) {
//     return res.status(404).json({ success: false, message: 'Artist not found' });
//   }

//   res.status(200).json({ success: true, message: 'Artist blocked successfully', data: artist });
// };


module.exports = { getAllArtistsForAdmin };
