const Rating = require("../../models/ratingModel");
const { sendGeneralResponse } = require("../../utils/responseHelper");

const deleteRating = async (req, res) => {
  const { reviewee_Id, customerId } = req.body; 

  if (!reviewee_Id || !customerId) {
    return sendGeneralResponse(res, false, "Both reviewee_Id and customerId are required", 400);
  }

  try {
    // Check if the customer has rated this salon/artist (reviewee)
    const rating = await Rating.findOne({ reviewee_Id, customerId });
    if (!rating) {
      return sendGeneralResponse(res, false, "No rating found to delete", 404);
    }
    await Rating.deleteOne({ _id: rating._id });
    return sendGeneralResponse(res, true, "Rating deleted successfully", 200);
  } catch (error) {
    console.error("Error deleting rating:", error);
    return sendGeneralResponse(res, false, "Internal Server Error", 500);
  }
};

module.exports = { deleteRating };
