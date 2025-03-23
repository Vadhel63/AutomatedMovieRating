const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Movie = require("../Models/Movie");
const HttpError = require("../Models/http-errors");
const auth = require("../middleware/auth");
const { isProducer } = require("../middleware/auth");
const { upload } = require("../middleware/Cloudinary");
// Create a new movie
router.post(
  "/",
  upload.single("MovieImage"),
  auth,
  isProducer,
  async (req, res, next) => {
    const { Name, Description, Type, MovieImage, RealesedDate } = req.body;

    const newMovie = new Movie({
      Name,
      Description,
      Type,
      MovieImage: req.file.path,
      RealesedDate,
      updatedAt: new Date(),
      Producer: req.userData.userId, // Associate the movie with the logged-in Producer
    });

    try {
      const savedMovie = await newMovie.save();
      res
        .status(201)
        .json({ message: "Movie created successfully", movie: savedMovie });
    } catch (err) {
      const error = new HttpError(
        "Creating movie failed, please try again.",
        500
      );
      return next(error);
    }
  }
);

// Fetch all movies for the logged-in Producer
router.get("/", auth, isProducer, async (req, res, next) => {
  try {
    const movies = await Movie.find({ Producer: req.userData.userId }).populate(
      "Producer",
      "UserName Email"
    );
    res.json({ movies });
  } catch (err) {
    const error = new HttpError(
      "Fetching movies failed, please try again later.",
      500
    );
    return next(error);
  }
});
router.get("/all", async (req, res, next) => {
  try {
    const movies = await Movie.find().populate("Producer", "UserName Email");
    res.json({ movies });
  } catch (err) {
    const error = new HttpError(
      "Fetching movies failed, please try again later.",
      500
    );
    return next(error);
  }
});

router.get("/search", auth, async (req, res, next) => {
  const { term } = req.query;
  console.log("Search term:", term);

  try {
    const movies = await Movie.find({
      $and: [
        {
          $or: [
            { Name: { $regex: term, $options: "i" } },
            { Type: { $regex: term, $options: "i" } },
          ],
        },
        req.userData.role === "Producer"
          ? { Producer: req.userData.userId }
          : {}, // Restrict to producer's movies if user is a producer
      ],
    }).populate("Producer", "UserName Email");
    console.log("Movies found:", movies);
    res.json({ movies });
  } catch (err) {
    console.error("Error during movie search:", err);
    return res
      .status(500)
      .json({ message: "Searching movies failed, please try again later." });
  }
});

// Fetch a specific movie by ID
// Dynamic route for fetching movie by ID
router.get("/:id", auth, isProducer, async (req, res, next) => {
  const movieId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(movieId)) {
    console.error("Invalid movie ID format:", movieId);
    return res.status(400).json({ message: "Invalid movie ID format." });
  }

  try {
    const movie = await Movie.findById(movieId).populate(
      "Producer",
      "UserName Email"
    );
    console.log(movie.Producer[0]._id); //producer field is array list thats why write like this
    if (!movie || movie.Producer[0]._id.toString() !== req.userData.userId) {
      console.error("Movie not found or unauthorized access.");
      return res.status(404).json({ message: "Movie not found." });
    }

    res.json({ movie });
  } catch (err) {
    console.error("Error fetching movie:", err);
    return res
      .status(500)
      .json({ message: "Fetching movie failed, please try again later." });
  }
});

// Update a movie
router.patch(
  "/:id",
  upload.single("MovieImage"),
  auth,
  isProducer,
  async (req, res, next) => {
    const movieId = req.params.id;
    const { Name, Description, MovieRating, Type, MovieImage, RealesedDate } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return next(new HttpError("Invalid movie ID format.", 400));
    }

    try {
      const movie = await Movie.findOne({
        _id: movieId,
        Producer: req.userData.userId,
      });
      if (!movie) {
        return next(new HttpError("Movie not found.", 404));
      }

      // Update fields if provided in the request body
      if (Name) movie.Name = Name;
      if (Description) movie.Description = Description;
      if (MovieRating) movie.MovieRating = MovieRating;
      if (Type) movie.Type = Type;
      if (RealesedDate) movie.RealesedDate = RealesedDate;
      if (req.file) {
        movie.MovieImage = req.file.path;
      }
      movie.updatedAt = new Date();

      await movie.save();
      res.json({ message: "Movie updated successfully", movie });
    } catch (err) {
      const error = new HttpError(
        "Updating movie failed, please try again.",
        500
      );
      return next(error);
    }
  }
);

// Delete a movie
router.delete("/:id", auth, isProducer, async (req, res, next) => {
  const movieId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(movieId)) {
    return next(new HttpError("Invalid movie ID format.", 400));
  }

  try {
    const movie = await Movie.findOne({
      _id: movieId,
      Producer: req.userData.userId,
    });
    if (!movie) {
      return next(new HttpError("Movie not found.", 404));
    }

    await Movie.findByIdAndDelete(movieId);
    res.json({ message: "Movie deleted successfully" });
  } catch (err) {
    const error = new HttpError(
      "Deleting movie failed, please try again.",
      500
    );
    return next(error);
  }
});

module.exports = router;
