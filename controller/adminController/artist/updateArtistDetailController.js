const { Artist } = require("../../models/userModel");
const { sendGeneralResponse } = require("../../utils/responseHelper");

// ✅ Update Artist Details
const updateArtistDetailsForAdmin = async (req, res) => {
  try {
    const artistId = req.params.artistId;
    const updateData = req.body;

    const artist = await Artist.findByIdAndUpdate(artistId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!artist) {
      return sendGeneralResponse(res, false, "Artist not found", 404, null);
    }

    return sendGeneralResponse(res, true, "Artist updated successfully", 200, artist);
  } catch (error) {
    console.error("Error updating artist:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ✅ Delete Artist
const deleteArtistByAdmin = async (req, res) => {
  try {
    const artistId = req.params.artistId;

    const artist = await Artist.findByIdAndDelete(artistId);

    if (!artist) {
      return sendGeneralResponse(res, false, "Artist not found", 404, null);
    }

    return sendGeneralResponse(res, true, "Artist deleted successfully", 200, null);
  } catch (error) {
    console.error("Error deleting artist:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  updateArtistDetailsForAdmin,
  deleteArtistByAdmin,
};
