"use client";

import { useState, useEffect } from "react";
import { Search, Filter, History, Star, Film, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../assests/s10.jpg";
import { FaUser, FaSearch, FaSignOutAlt } from "react-icons/fa";

const UserDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [movies, setMovies] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [recentlyVisited, setRecentlyVisited] = useState([]);
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [movieReviews, setMovieReviews] = useState([]);
  const [reviewLikes, setReviewLikes] = useState({});
  const [reviewDislikes, setReviewDislikes] = useState({});
  const navigate = useNavigate();

  // Fetch user data and token from localStorage or context
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = JSON.parse(localStorage.getItem("user"));
    if (token && userData) {
      setAuthToken(token);
      setUser(userData);
    }
  }, []);

  // Fetch movies from API
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch("http://localhost:5000/Movie/all", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setMovies(data);
          } else if (
            data &&
            typeof data === "object" &&
            Array.isArray(data.movies)
          ) {
            setMovies(data.movies);
          } else {
            console.error("API did not return an array of movies", data);
          }
        } else {
          console.error("Failed to fetch movies");
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    if (authToken) {
      fetchMovies();
    }
  }, [authToken]);

  // Handle movie click to track recently visited movies
  const handleMovieClick = (movie) => {
    const updatedRecentlyVisited = [
      movie,
      ...recentlyVisited.filter((m) => m._id !== movie._id).slice(0, 4),
    ];
    setRecentlyVisited(updatedRecentlyVisited);
  };
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };
  // Handle search functionality
  const handleSearch = async (term) => {
    try {
      const response = await fetch(
        `http://localhost:5000/Movie/search?term=${term}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMovies(data.movies);
      } else {
        console.error("Failed to search movies");
      }
    } catch (error) {
      console.error("Error searching movies:", error);
    }
  };

  // Fetch reviews for a specific movie
  const fetchMovieReviews = async (movieId) => {
    try {
      console.log(movieId);
      const response = await fetch(
        `http://localhost:5000/review/Movie/${movieId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();
      setMovieReviews(data.reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleWriteReview = (movie) => {
    setSelectedMovie(movie);
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    try {
      const response = await fetch("http://localhost:5000/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          Description: reviewText,
          rating: reviewRating,
          User: user.user._id,
          Movie: selectedMovie._id,
        }),
      });
      console.log(user);
      if (response.ok) {
        console.log("Review submitted successfully");
        fetchMovieReviews(selectedMovie._id); // Refresh reviews after submission
      } else {
        console.error("Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    }

    setShowReviewModal(false);
    setReviewText("");
    setReviewRating(5);
    setSelectedMovie(null);
  };

  const handleLikeDislike = async (reviewId, action) => {
    try {
      // Here you would normally make an API call to update likes/dislikes
      // For now, we'll just update the UI state
      if (action === "like") {
        setReviewLikes({
          ...reviewLikes,
          [reviewId]: (reviewLikes[reviewId] || 0) + 1,
        });
      } else if (action === "dislike") {
        setReviewDislikes({
          ...reviewDislikes,
          [reviewId]: (reviewDislikes[reviewId] || 0) + 1,
        });
      }
    } catch (error) {
      console.error(`Error ${action}ing review:`, error);
    }
  };

  // Define filteredMovies here
  const filteredMovies = Array.isArray(movies)
    ? movies.filter(
        (movie) =>
          (selectedFilter === "All" || movie.Type === selectedFilter) &&
          movie.Name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header Component */}
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Film size={24} />
            <h1 className="text-xl font-bold">MovieHub</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search movies..."
                  className="w-full px-4 py-2 pl-10 rounded-lg text-gray-800 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleSearch(e.target.value);
                  }}
                />
                <Search
                  className="absolute left-3 top-2.5 text-gray-500"
                  size={18}
                />
              </div>
            </div>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center text-sm bg-red-600 hover:bg-red-700 py-1 px-3 rounded transition duration-300"
            >
              <FaSignOutAlt className="mr-1" />
              Logout
            </button>
            <div
              className="cursor-pointer group relative"
              onClick={() => navigate("/profile")}
            >
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                <img
                  src={
                    user?.user?.ProfileImage
                      ? user.user.ProfileImage
                      : defaultAvatar
                  }
                  alt="User Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden group-hover:block absolute right-0 top-12 bg-white text-gray-800 rounded-md shadow-lg p-2">
                <p className="whitespace-nowrap">Go to Profile</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar with Filters and History */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center mb-4">
              <Filter size={20} className="mr-2 text-gray-600" />
              <h2 className="text-lg font-semibold">Filters</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "All",
                "Romantic",
                "Action",
                "Comedy",
                "Drama",
                "Sci-Fi",
                "Fantasy",
                "Crime",
                "Documentary",
              ].map((filter) => (
                <button
                  key={filter}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedFilter === filter
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setSelectedFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center mb-4">
              <History size={20} className="mr-2 text-gray-600" />
              <h2 className="text-lg font-semibold">Watch History</h2>
            </div>
            <div className="space-y-3">
              {(showAllHistory
                ? recentlyVisited
                : recentlyVisited.slice(0, 5)
              ).map((movie, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-10 h-10 rounded bg-gray-200 flex-shrink-0">
                    <img
                      src={
                        movie.MovieImage ||
                        "/placeholder.svg?height=40&width=40" ||
                        "/placeholder.svg"
                      }
                      alt={movie.Name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{movie.Name}</p>
                    <p className="text-xs text-gray-500">Visited recently</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="mt-4 text-sm text-blue-600 hover:underline"
              onClick={() => setShowAllHistory(!showAllHistory)}
            >
              {showAllHistory ? "Show Less" : "View All History"}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow">
          {/* Movie Recommendations */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Star size={20} className="mr-2 text-yellow-500" />
              Recommended for You
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {movies.slice(0, 2).map((movie) => (
                <div
                  key={movie._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden flex"
                >
                  <div className="w-24 h-36 flex-shrink-0">
                    <img
                      src={movie.MovieImage || "/placeholder.svg"}
                      alt={movie.Name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold">{movie.Name}</h3>
                      <p className="text-sm text-gray-600">{movie.Type}</p>
                      <p className="text-sm text-gray-500">
                        {movie.Description}
                      </p>
                    </div>
                    <div className="flex items-center mt-2">
                      <Star
                        size={16}
                        className="text-yellow-500 mr-1"
                        fill="currentColor"
                      />
                      <span className="text-sm">{movie.MovieRating}/5</span>
                    </div>
                    <button
                      className="mt-2 text-sm text-blue-600 hover:underline"
                      onClick={() => handleWriteReview(movie)}
                    >
                      Write Review
                    </button>
                    <button
                      className="mt-2 text-sm text-blue-600 hover:underline"
                      onClick={() => {
                        setSelectedMovie(movie);
                        setShowReviews(true);
                        fetchMovieReviews(movie._id);
                      }}
                    >
                      View Reviews
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Movie Browse Section */}
          <div>
            <h2 className="text-xl font-bold mb-4">Browse Movies</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMovies.map((movie) => (
                <div
                  key={movie._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                  onClick={() => handleMovieClick(movie)}
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={
                        movie.MovieImage ||
                        "/placeholder.svg?height=300&width=200" ||
                        "/placeholder.svg"
                      }
                      alt={movie.Name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate">{movie.Name}</h3>
                    <p className="text-sm text-gray-600">{movie.Type}</p>
                    <p className="text-sm text-gray-500">{movie.Description}</p>
                    <div className="flex items-center mt-2">
                      <Star
                        size={16}
                        className="text-yellow-500 mr-1"
                        fill="currentColor"
                      />
                      <span className="text-sm">{movie.MovieRating}/5</span>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md">
                        Watch
                      </button>
                      <button
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md"
                        onClick={() => handleWriteReview(movie)}
                      >
                        Review
                      </button>
                      <button
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md"
                        onClick={() => {
                          setSelectedMovie(movie);
                          setShowReviews(true);
                          fetchMovieReviews(movie._id);
                        }}
                      >
                        View Reviews
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedMovie && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Write a Review</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center mb-4">
                <div className="w-16 h-24 flex-shrink-0 mr-4">
                  <img
                    src={
                      selectedMovie.MovieImage ||
                      "/placeholder.svg?height=300&width=200" ||
                      "/placeholder.svg"
                    }
                    alt={selectedMovie.Name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">{selectedMovie.Name}</h4>
                  <p className="text-sm text-gray-600">{selectedMovie.Type}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Rating
                </label>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={24}
                      className={`cursor-pointer ${
                        star <= reviewRating
                          ? "text-yellow-500"
                          : "text-gray-300"
                      }`}
                      fill={star <= reviewRating ? "currentColor" : "none"}
                      onClick={() => setReviewRating(star)}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Review
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={5}
                  placeholder="Share your thoughts about this movie..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={submitReview}
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Modal */}
      {showReviews && selectedMovie && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold flex items-center">
                <Film className="mr-2 text-blue-600" size={20} />
                Reviews for {selectedMovie.Name}
              </h3>
              <button
                onClick={() => setShowReviews(false)}
                className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-grow">
              {movieReviews.length > 0 ? (
                movieReviews.map((review) => (
                  <div
                    key={review._id}
                    className="mb-6 border-b pb-4 last:border-0"
                  >
                    <div className="flex items-start mb-3">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                        <img
                          src={review.User.ProfileImage || defaultAvatar}
                          alt={review.User.UserName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900">
                            {review.User.UserName}
                          </h4>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={16}
                                className="text-yellow-500"
                                fill={
                                  star <= review.rating
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(
                            review.createdAt || Date.now()
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="ml-13 pl-13">
                      <p className="text-gray-800 mb-3">{review.Description}</p>

                      <div className="flex items-center space-x-4 mt-2">
                        <button
                          className="flex items-center text-gray-600 hover:text-blue-600 text-sm"
                          onClick={() => handleLikeDislike(review._id, "like")}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                            />
                          </svg>
                          {reviewLikes[review._id] || review.likeCount || 0}{" "}
                          Likes
                        </button>
                        <button
                          className="flex items-center text-gray-600 hover:text-red-600 text-sm"
                          onClick={() =>
                            handleLikeDislike(review._id, "dislike")
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                            />
                          </svg>
                          {reviewDislikes[review._id] ||
                            review.dislikeCount ||
                            0}{" "}
                          Dislikes
                        </button>
                        <button className="flex items-center text-gray-600 hover:text-purple-600 text-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 mb-4 text-gray-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">
                    No reviews yet. Be the first to share your thoughts!
                  </p>
                  <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={() => {
                      setShowReviews(false);
                      handleWriteReview(selectedMovie);
                    }}
                  >
                    Write a Review
                  </button>
                </div>
              )}
            </div>

            {movieReviews.length > 0 && (
              <div className="p-4 border-t sticky bottom-0 bg-white">
                <button
                  className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                  onClick={() => {
                    setShowReviews(false);
                    handleWriteReview(selectedMovie);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Write Your Review
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
