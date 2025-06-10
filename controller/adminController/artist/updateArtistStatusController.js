const { Artist } = require("../../../models/userModel");
const { sendGeneralResponse } = require("../../../utils/responseHelper");

// Block artist with reason
const blockArtist = async (req, res) => {
    try {
        const { artistId } = req.params;
        const { reason } = req.body;

        const artist = await Artist.findById(artistId);
        if (!artist) {
            return sendGeneralResponse(res, false, "Artist not found", 404, null);
        }

        artist.Status = 'blocked';
        artist.blockedAt = new Date();
        artist.blockReason = reason || 'No reason provided';

        await artist.save();

        return sendGeneralResponse(res, true, "Artist has been blocked successfully", 200, {
            artistId: artist._id,
            status: artist.Status,
            blockedAt: artist.blockedAt,
            blockReason: artist.blockReason
        });
    } catch (error) {
        console.error("Error blocking artist:", error);
        return sendGeneralResponse(res, false, "Internal server error", 500, null);
    }
};


// Unblock artist
const unblockArtist = async (req, res) => {
    try {
        const { artistId } = req.params;

        const artist = await Artist.findById(artistId);
        if (!artist) {
            return sendGeneralResponse(res, false, "Artist not found", 404, null);
        }

        artist.Status = 'approved';
        artist.blockedAt = null;
        artist.blockReason = '';

        await artist.save();

        return sendGeneralResponse(res, true, "Artist has been unblocked successfully", 200, {
            artistId: artist._id,
            status: artist.Status
        });
    } catch (error) {
        console.error("Error unblocking artist:", error);
        return sendGeneralResponse(res, false, "Internal server error", 500, null);
    }
};

module.exports = {
    blockArtist,
    unblockArtist,
};
