const Rating = require("../../models/ratingModel");
const { sendGeneralResponse } = require("../../utils/responseHelper");


const editReview = async (req, res) => {
  const { customerId, ratingId, rating, message } = req.body;

  // Validate required fields: Ensure customerId, ratingId, and either rating or message are provided
  if (!customerId || !ratingId) {
    return sendGeneralResponse(res, false, "Customer ID and Rating ID are required", 400);
  }

  // Ensure rating is between 1 and 5 if rating is provided
  if (rating && (rating < 1 || rating > 5)) {
    return sendGeneralResponse(res, false, "Rating must be between 1 and 5", 400);
  }

  // Ensure at least one of rating or message is provided
  if (!rating && !message) {
    return sendGeneralResponse(res, false, "Either a rating or a message must be provided", 400);
  }

  try {
    // Find the specific rating by ratingId
    const existingRating = await Rating.findById(ratingId);

    if (!existingRating) {
      // If no existing rating found with the provided ratingId, return an error
      return sendGeneralResponse(res, false, "No review found to edit", 404);
    }

    // Ensure that only the customer who created the review can edit it
    if (existingRating.customerId.toString() !== customerId.toString()) {
      return sendGeneralResponse(res, false, "You can only edit your own review", 403);
    }

    // Update the rating and/or message if provided
    if (rating) {
      existingRating.rating = rating;
    }
    if (message !== undefined) { 
      existingRating.message = message;
    }

    // Save the updated review
    await existingRating.save();

    return sendGeneralResponse(res, true, "Review updated successfully", 200);
  } catch (error) {
    console.error("Error editing review:", error);
    return sendGeneralResponse(res, false, "Internal server error", 500);
  }
};

module.exports = { editReview };