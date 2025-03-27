const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const HttpError = require("../Models/http-errors");
const mongoose = require("mongoose");
const { upload } = require("../middleware/Cloudinary");

const { isAdmin } = require("../middleware/auth");
// router.post("/signup", async (req, res, next) => {
//   const { UserName, Email, Password, Role } = req.body;
//   let existingUser;

//   try {
//     existingUser = await User.findOne({ Email: Email });
//   } catch (err) {
//     const error = new HttpError("Signup failed, please try again", 500);
//     return next(error);
//   }

//   if (existingUser) {
//     const error = new HttpError("User is already present", 422);
//     return next(error);
//   }

//   const hashedPassword = await bcrypt.hash(Password, 12);

//   const currentTime = new Date();

//   const createdUser = new User({
//     UserName: UserName,
//     Email: Email,
//     Password: hashedPassword,
//     Role: Role,
//     createdAt: currentTime,
//     updatedAt: currentTime,
//   });

//   try {
//     await createdUser.save();
//     const payload = { userId: createdUser._id, Role: createdUser.Role };
//     const token = jwt.sign(payload, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });
//     res.json({ token: token, user: createdUser });
//   } catch (err) {
//     console.error("Error saving user:", err); // Log the error for debugging
//     const error = new HttpError("Signup failed, please try again", 500);
//     return next(error);
//   }
// });

router.post("/history", auth, async (req, res, next) => {
  try {
    const userId = req.userData?.userId;
    const { movieId } = req.body;

    if (!userId || !movieId) {
      return next(new HttpError("User ID and Movie ID are required.", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return next(new HttpError("Invalid movie ID format.", 400));
    }

    // Find the user and update their history
    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("User not found.", 404));
    }

    // Check if movie already exists in history
    const existingEntry = user.History.find(
      (entry) => entry.movieId.toString() === movieId
    );

    if (existingEntry) {
      // Update the timestamp if movie already exists in history
      existingEntry.visitedAt = new Date();
    } else {
      // Add new entry to history
      user.History.unshift({
        movieId,
        visitedAt: new Date(),
      });
    }

    await user.save();
    res.status(200).json({ message: "History updated successfully" });
  } catch (err) {
    console.error("Error updating history:", err);
    next(
      new HttpError("Failed to update history, please try again later.", 500)
    );
  }
});

// Get user history
router.get("/history", auth, async (req, res, next) => {
  try {
    const userId = req.userData?.userId;

    if (!userId) {
      return next(new HttpError("Unauthorized access.", 401));
    }

    const user = await User.findById(userId).populate({
      path: "History.movieId",
      model: "Movie",
      select: "Name MovieImage Type MovieRating Description",
    });

    if (!user) {
      return next(new HttpError("User not found.", 404));
    }

    // Format the history data for the frontend
    const history = user.History.map((item) => ({
      _id: item.movieId?._id || item.movieId,
      Name: item.movieId?.Name || "Unknown Movie",
      MovieImage: item.movieId?.MovieImage || null,
      Type: item.movieId?.Type || "Unknown",
      MovieRating: item.movieId?.MovieRating || 0,
      Description: item.movieId?.Description || "",
      visitedAt: item.visitedAt,
    }));

    res.status(200).json({ history });
  } catch (err) {
    console.error("Error fetching history:", err);
    next(
      new HttpError("Failed to fetch history, please try again later.", 500)
    );
  }
});

//----------------------------------------------------
router.post("/signup", async (req, res, next) => {
  const { UserName, Email, Password, Role } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ Email: Email });
  } catch (err) {
    return next(new HttpError("Signup failed, please try again", 500));
  }

  if (existingUser) {
    return next(new HttpError("User is already present", 422));
  }

  const hashedPassword = await bcrypt.hash(Password, 12);
  const status = Role === "Producer" ? "Pending" : "Accepted"; // Only Producers require admin approval

  const createdUser = new User({
    UserName,
    Email,
    Password: hashedPassword,
    Role,
    Status: status,
  });

  try {
    await createdUser.save();
    res.status(201).json({
      message: "Signup successful. Waiting for admin approval if Producer.",
    });
  } catch (err) {
    return next(new HttpError("Signup failed, please try again", 500));
  }
});

router.get("/pending-producers", async (req, res, next) => {
  try {
    const pendingProducers = await User.find({
      Role: "Producer",
      Status: "Pending",
    });
    res.json(pendingProducers);
  } catch (err) {
    return next(new HttpError("Failed to fetch pending producers", 500));
  }
});

router.patch("/update-producer/:id", async (req, res, next) => {
  const { id } = req.params;
  const { action } = req.body; // "Accept" or "Reject"

  try {
    const updatedStatus = action === "Accept" ? "Accepted" : "Rejected";
    await User.findByIdAndUpdate(id, { Status: updatedStatus }, { new: true });
    res.json({ message: `Producer ${updatedStatus}` });
  } catch (err) {
    return next(new HttpError("Failed to update producer status", 500));
  }
});

router.post("/login", async (req, res, next) => {
  const { Email, Password } = req.body;
  const identifiedUser = await User.findOne({ Email: Email });

  if (!identifiedUser) {
    const error = new HttpError("Invalid credentials", 401);
    return next(error);
  }

  const isValidPassword = await bcrypt.compare(
    Password,
    identifiedUser.Password
  );

  if (!isValidPassword) {
    const error = new HttpError("Invalid credentials", 401);
    return next(error);
  }

  const token = jwt.sign(
    { userId: identifiedUser._id, role: identifiedUser.Role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // You may want to send back user data or a token upon successful login
  res.json({ token: token, user: identifiedUser });
});
router.get("/", auth, isAdmin, async (req, res, next) => {
  try {
    const users = await User.find();
    res.json({ users });
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later.",
      500
    );
    return next(error);
  }
});
// Get logged-in user's profile
router.get("/profile", auth, async (req, res, next) => {
  try {
    const userId = req.userData?.userId; // Set by the authentication middleware
    if (!userId) {
      return next(new HttpError("Unauthorized access.", 401));
    }

    const user = await User.findById(userId, "-password"); // Exclude sensitive data like password
    if (!user) {
      return next(new HttpError("User not found.", 404));
    }
    console.log(user);
    res.status(200).json({ user });
  } catch (err) {
    const error = new HttpError(
      "Fetching profile failed, please try again later.",
      500
    );
    next(error);
  }
});

// Get user by ID
router.get("/:id", async (req, res, next) => {
  const userId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new HttpError("Invalid user ID format.", 400));
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("User not found.", 404));
    }
    res.json({ user });
  } catch (err) {
    const error = new HttpError(
      "Fetching user failed, please try again later.",
      500
    );
    return next(error);
  }
});

/// Update user
router.put("/:id", upload.single("ProfileImage"), async (req, res, next) => {
  const userId = req.params.id;
  const { UserName, Email } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new HttpError("Invalid user ID format.", 400));
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("User not found.", 404));
    }

    // Update fields if provided in the request body
    if (UserName) user.UserName = UserName;
    if (Email) user.Email = Email;

    // Check if an image was uploaded
    if (req.file) {
      user.ProfileImage = req.file.path; // Cloudinary URL
    }

    user.updatedAt = new Date();
    await user.save();

    console.log("Updated user:", user);
    res.json({ message: "User updated successfully", user });
  } catch (err) {
    return next(new HttpError("Updating user failed, please try again.", 500));
  }
});

// Delete user
router.delete("/:id", async (req, res, next) => {
  const userId = req.params.id;

  console.log("Received user ID for deletion:", userId); // Log the received user ID

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new HttpError("Invalid user ID format.", 400));
  }

  try {
    const response = await User.findByIdAndDelete(userId);
    if (!response) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User data deleted successfully");
    res.status(200).json({ message: "User successfully deleted" });
  } catch (err) {
    console.error("Error deleting user:", err); // Log the error
    res.status(500).json({ message: "Internal server error", error: err });
  }
});

router.post("/train-model", auth, isAdmin, async (req, res) => {
  const { timeframe } = req.body;
  try {
    // Add your model training logic here based on the timeframe
    res.json({ message: `Model trained for ${timeframe}.` });
  } catch (err) {
    res.status(500).json({ message: "Failed to train model." });
  }
});

module.exports = router;
