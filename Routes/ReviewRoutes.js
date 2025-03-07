const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Review = require("../Models/Review");
const HttpError = require("../Models/http-errors");
const auth = require("../middleware/auth");

// Create a new review
router.post("/", async (req, res, next) => {
  const { Description, User, Movie } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(User) ||
    !mongoose.Types.ObjectId.isValid(Movie)
  ) {
    return next(new HttpError("Invalid User or Movie ID format.", 400));
  }

  const newReview = new Review({ Description, User, Movie });

  try {
    await newReview.save();
    return res
      .status(201)
      .json({ message: "Review created successfully", review: newReview });
  } catch (err) {
    console.error("Error saving review:", err);

    if (err.name === "ValidationError") {
      return next(new HttpError(`Validation error: ${err.message}`, 400));
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
      .populate("User", "UserName")
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

module.exports = router;
