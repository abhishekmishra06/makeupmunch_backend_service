const Rating = require("../../models/ratingModel");
const { sendGeneralResponse } = require("../../utils/responseHelper");

const getRatings = async (req, res) => {
  const { reviewee_Id, customerId, reviewId } = req.query; // Use req.query for GET requests

  if (!reviewee_Id || !customerId) {
    return sendGeneralResponse(res, false, "Both reviewee_Id and customerId are required", 400);
  }

  try {
    // Fetch all ratings for the given reviewee (salon/artist) and sort by latest first
    const allRatings = await Rating.find({ reviewee_Id }).sort({ createdAt: -1 });

    // Check if the customer has already rated this salon/artist
    const customerRating = await Rating.findOne({ reviewee_Id, customerId });

    let customerRatingData = null;
    let formattedRatings = [...allRatings]; 

    // Step 2: If customer has rated, place their rating at the top and remove it from allRatings
    if (customerRating) {
      customerRatingData = customerRating;  // The customer's rating will be highlighted
      // Remove the customer's rating from the allRatings array to avoid duplicating in ratings
      formattedRatings = formattedRatings.filter(rating => rating._id.toString() !== customerRating._id.toString());
    }

    // New feature: If reviewId is provided, filter ratings to return only that review
    if (reviewId) {
      const specificRating = await Rating.findById(reviewId);
      return res.status(200).json({
        success: true,
        specificRating, // Return the specific rating if found
      });
    }

    return res.status(200).json({
      success: true,
      customerRating: customerRatingData, // The customer's rating (if available) at the top
      ratings: formattedRatings // All ratings, without the customer's rating
    });

  } catch (error) {
    console.error("Error fetching ratings:", error);
    return sendGeneralResponse(res, false, "Internal Server Error", 500);
  }
};

// Update the route to use GET instead of POST


module.exports = { getRatings };