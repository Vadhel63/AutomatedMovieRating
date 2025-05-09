const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Review = require("../Models/Review");
const HttpError = require("../Models/http-errors");
const auth = require("../middleware/auth");
const axios = require("axios");

router.post("/", async (req, res, next) => {
  const { Description, User, Movie } = req.body;

  if (!Description) {
    return next(new HttpError("Review description is required.", 400));
  }

  if (
    !mongoose.Types.ObjectId.isValid(User) ||
    !mongoose.Types.ObjectId.isValid(Movie)
  ) {
    return next(new HttpError("Invalid User or Movie ID format.", 400));
  }

  try {
    // 🔥 Debug API Request
    console.log("📡 Sending request to API...");
    console.log("Request Body:", { review: Description });

    const response = await axios.post(
      "https://Milan63-lstm-api.hf.space/predict",
      { review: Description }
    );

    console.log("✅ API Response:", response.data);

    if (!response.data || typeof response.data.predicted_rating !== "number") {
      throw new Error("Failed to get a valid prediction.");
    }

    const predictedRating = response.data.predicted_rating; // Floating value

    // 🔥 Save review with floating rating
    const newReview = new Review({
      Description,
      User,
      Movie,
      rating: predictedRating, // Keep it as a floating number
    });

    await newReview.save();

    return res
      .status(201)
      .json({ message: "Review created successfully", review: newReview });
  } catch (err) {
    console.error("❌ Error processing review:", err);

    if (err.response) {
      console.error("API Error Details:", err.response.data);
      return next(
        new HttpError(
          `Prediction API Error: ${err.response.data.error || "Unknown error"}`,
          500
        )
      );
    }

    return next(
      new HttpError("Creating review failed, please try again.", 500)
    );
  }
});

// Get all reviews
router.get("/", async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate("User", "UserName")
      .populate("Movie", "Title");
    res.json({ reviews });
  } catch (err) {
    const error = new HttpError(
      "Fetching reviews failed, please try again later.",
      500
    );
    return next(error);
  }
});
//Get review by MovieId
router.get("/Movie/:id", auth, async (req, res, next) => {
  const MovieId = req.params.id;
  console.log(MovieId);
  if (!mongoose.Types.ObjectId.isValid(MovieId)) {
    return next(new HttpError("Invalid Movie ID format.", 400));
  }
  try {
    const reviews = await Review.find({ Movie: MovieId })
      .populate("User", "UserName ProfileImage")
      .populate("Movie", "Name");
    if (!reviews) {
      return next(new HttpError("No reviews found for this movie.", 404));
    }
    res.json({ reviews });
  } catch (err) {
    const error = new HttpError("Fetching Reviews Failed ,Please Try again");
    return next(error);
  }
});

// Get review by ID
router.get("/:id", async (req, res, next) => {
  const reviewId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    return next(new HttpError("Invalid review ID format.", 400));
  }

  try {
    const review = await Review.findById(reviewId)
      .populate("User", "UserName")
      .populate("Movie", "Name");
    if (!review) {
      return next(new HttpError("Review not found.", 404));
    }
    res.json({ review });
  } catch (err) {
    const error = new HttpError(
      "Fetching review failed, please try again later.",
      500
    );
    return next(error);
  }
});

// Update a review
router.patch("/:id", async (req, res, next) => {
  const reviewId = req.params.id;
  const { Description, LikeCount, DislikeCount } = req.body;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    return next(new HttpError("Invalid review ID format.", 400));
  }

  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      return next(new HttpError("Review not found.", 404));
    }

    // Update fields if provided in the request body
    if (Description) review.Description = Description;
    if (LikeCount !== undefined) review.LikeCount = LikeCount;
    if (DislikeCount !== undefined) review.DislikeCount = DislikeCount;

    review.updatedAt = new Date();

    await review.save();
    res.json({ message: "Review updated successfully", review });
  } catch (err) {
    const error = new HttpError(
      "Updating review failed, please try again.",
      500
    );
    return next(error);
  }
});

// Delete a review
router.delete("/:id", async (req, res, next) => {
  const reviewId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    return next(new HttpError("Invalid review ID format.", 400));
  }

  try {
    const review = await Review.findByIdAndDelete(reviewId);

    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    const error = new HttpError(
      "Deleting review failed, please try again.",
      500
    );
    return next(error);
  }
});

router.post("/:reviewId/react", async (req, res) => {
  try {
    const { userId, action } = req.body;
    const { reviewId } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ error: "Invalid review ID" });
    }

    // ✅ Find review
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ error: "Review not found" });

    // Ensure lists exist
    review.LikedUsers = review.LikedUsers || [];
    review.DislikedUsers = review.DislikedUsers || [];

    // Convert ObjectId to string for comparison
    const hasLiked = review.LikedUsers.map((id) => id.toString()).includes(
      userId
    );
    const hasDisliked = review.DislikedUsers.map((id) =>
      id.toString()
    ).includes(userId);

    if (action === "like") {
      if (hasLiked) {
        review.LikeCount = Math.max(review.LikeCount - 1, 0);
        review.LikedUsers = review.LikedUsers.filter(
          (id) => id.toString() !== userId
        );
      } else {
        if (hasDisliked) {
          review.DislikeCount = Math.max(review.DislikeCount - 1, 0);
          review.DislikedUsers = review.DislikedUsers.filter(
            (id) => id.toString() !== userId
          );
        }
        review.LikeCount += 1;
        review.LikedUsers.push(userId);
      }
    } else if (action === "dislike") {
      if (hasDisliked) {
        review.DislikeCount = Math.max(review.DislikeCount - 1, 0);
        review.DislikedUsers = review.DislikedUsers.filter(
          (id) => id.toString() !== userId
        );
      } else {
        if (hasLiked) {
          review.LikeCount = Math.max(review.LikeCount - 1, 0);
          review.LikedUsers = review.LikedUsers.filter(
            (id) => id.toString() !== userId
          );
        }
        review.DislikeCount += 1;
        review.DislikedUsers.push(userId);
      }
    }

    // ✅ Save changes
    await review.save();

    return res.json({
      success: true,
      LikeCount: review.LikeCount,
      DislikeCount: review.DislikeCount,
    });
  } catch (error) {
    console.error("Error updating like/dislike:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
