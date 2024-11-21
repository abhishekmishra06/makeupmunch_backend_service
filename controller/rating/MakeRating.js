 
 

// const makeRating = async (req, res) => {
//     const { customerId, salonId, rating, message } = req.body;
  
//     // Validate required fields: Ensure either rating or message is provided
//     if (!customerId || !salonId) {
//       return sendGeneralResponse(res, false, "Customer ID and Salon ID are required", 400);
//     }
  
//     // Ensure rating is between 1 and 5
//     if (rating < 1 || rating > 5) {
//       return sendGeneralResponse(res, false, "Rating must be between 1 and 5", 400);
//     }
  
//     // Ensure at least one of rating or message is provided
//     if (!rating && !message) {
//       return sendGeneralResponse(res, false, "Either a rating or a message must be provided", 400);
//     }
  
//     try {
//       // Create new rating document 
//       const newRating =   giveRating({
//         customerId,
//         salonId,
//         rating: rating || null, // If rating is provided, save it; if not, save null
//         message: message || '', // If message is provided, save it; if not, save empty string
//       });
  
//       // Save the rating
//       await newRating.save();
  
//       return sendGeneralResponse(res, true, "Rating submitted successfully", 200);
//     } catch (error) {
//       console.error("Error submitting rating:", error);
//       return sendGeneralResponse(res, false, "Internal server error", 500);
//     }
//   };



//   module.exports = { makeRating }; 




















   const Rating = require("../../models/ratingModel");
const { sendGeneralResponse } = require("../../utils/responseHelper");
 

  

const makeRating = async (req, res) => {
  const { customerId, reviewee_Id, rating, message } = req.body;

  // Validate required fields: Ensure either rating or message is provided
  if (!customerId || !reviewee_Id) {
    return sendGeneralResponse(res, false, "Customer ID and Salon ID are required", 400);
  }

  // Ensure rating is between 1 and 5
  if (rating < 1 || rating > 5) {
    return sendGeneralResponse(res, false, "Rating must be between 1 and 5", 400);
  }

  // Ensure at least one of rating or message is provided
  if (!rating && !message) {
    return sendGeneralResponse(res, false, "Either a rating or a message must be provided", 400);
  }

  try {
    // Check if the customer has already rated this salon
    const existingRating = await Rating.findOne({ customerId, reviewee_Id });

    if (existingRating) {
      // If rating exists, update it
      existingRating.rating = rating || existingRating.rating;  // Update rating if provided
      existingRating.message = message || existingRating.message; // Update message if provided

      await existingRating.save(); // Save the updated rating

      return sendGeneralResponse(res, true, "Rating updated successfully", 200);
    } else {
      // If no existing rating, create a new one
      const newRating = Rating({
        customerId,
        reviewee_Id,
        rating: rating || null, // If rating is provided, save it; if not, save null
        message: message || '', // If message is provided, save it; if not, save empty string
      });

      // Save the new rating
      await newRating.save();

      return sendGeneralResponse(res, true, "Rating submitted successfully", 200);
    }
  } catch (error) {
    console.error("Error submitting rating:", error);
    return sendGeneralResponse(res, false, "Internal server error", 500);
  }
};



module.exports = { makeRating }; 