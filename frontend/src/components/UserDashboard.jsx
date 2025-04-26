"use client";

import { useState, useEffect } from "react";
import { Search, Filter, History, Star, Film, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../assests/s10.jpg";
import { FaSignOutAlt } from "react-icons/fa";

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
  const [likedReviews, setLikedReviews] = useState({});
  const [dislikedReviews, setdislikedReviews] = useState({});
  const [reviewDislikes, setReviewDislikes] = useState({});
  const [userHistory, setUserHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [movieStats, setMovieStats] = useState({});
  const [stats, setStats] = useState({});

  // const [authReady, setAuthReady] = useState(false);
  const navigate = useNavigate();

  
  // Fetch user data and token from localStorage or context
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = JSON.parse(localStorage.getItem("user"));
    if (token && userData) {
      setAuthToken(token);
      setUser(userData);
      // setAuthReady(true); // Mark ready whether data is found or not
    }
  }, []);

  const fetchReviewStats = async (movieId) => {
    try {
      // const token = localStorage.getItem("authToken");
      // if (!token) {
      //   navigate("/");
      //   return;
      // }
  
      const response = await fetch(
        `http://localhost:5000/review/Movie/${movieId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const data = await response.json();
      const reviews = data.reviews || [];
      const movieStats = calculateStats(reviews);
  
      setStats((prevStats) => {
        const newStats = {
          ...prevStats,
          [movieId]: movieStats,
        };
        console.log("Updated stats:", newStats);
        return newStats;
      });
      console.log("Updated stats:", newStats);
    } catch (err) {
      console.error("Error fetching review statistics:", err);
      
    }
  };
  
  
  const calculateStats = (reviews) => {
    console.log("Calculating stats for reviews:", reviews);
    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    const avgRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;
  
    const distribution = {
      "1-2": 0,
      "2-3": 0,
      "3-4": 0,
      "4-5": 0,
    };
  
    reviews.forEach((review) => {
      const rating = review.rating || 0;
      if (rating >= 1 && rating < 2) distribution["1-2"]++;
      else if (rating >= 2 && rating < 3) distribution["2-3"]++;
      else if (rating >= 3 && rating < 4) distribution["3-4"]++;
      else if (rating >= 4 && rating <= 5) distribution["4-5"]++;
    });
  
    return {
      totalReviews,
      averageRating: avgRating,
      distribution,
    };
  };
  
  
  // Fetch movies from API
  useEffect(() => {
    setTimeout(1000);

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

      fetchMovies();
  },[authToken]);
  
  
  
  // Fetch user history from backend
  useEffect(() => {
    // if (!authReady || !authToken || user?.user?.Role !== "User") return;
    setTimeout(1000);
    const fetchUserHistory = async () => {
      if (!authToken) return;

      setIsLoadingHistory(true);
      try {
        const response = await fetch("http://localhost:5000/user/history", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserHistory(data.history || []);
          // Also update the recentlyVisited state for compatibility
          setRecentlyVisited(data.history || []);
        } else {
          console.error("Failed to fetch user history");
        }
      } catch (error) {
        console.error("Error fetching user history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

      fetchUserHistory();
  }, [authToken]);

  // Handle movie click to track recently visited movies
  const handleMovieClick = async (movie) => {
    // Update local state for immediate UI feedback
    const updatedRecentlyVisited = [
      movie,
      ...recentlyVisited.filter((m) => m._id !== movie._id),
    ];
    setRecentlyVisited(updatedRecentlyVisited);

    // Send request to backend to update history
    if (authToken && user?.user?.Role === "User") {
      try {
        await fetch("http://localhost:5000/user/history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ movieId: movie._id }),
        });
      } catch (error) {
        console.error("Error updating watch history:", error);
      }
    }
  };

  // Handle watch button click
  const handleWatchClick = async (movie, e) => {
    // Prevent the parent onClick from firing
    if (e) {
      e.stopPropagation();
    }

    // Call the same function as clicking on the movie
    handleMovieClick(movie);

    // Additional logic for watching the movie could go here
    console.log(`Watching movie: ${movie.Name}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };
  useEffect(() => {
    movies.forEach((movie) => {
      fetchReviewStats(movie._id);
    });
  }, [movies]);
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
    if (!selectedMovie || !user?.user?._id || !authToken) {
      console.error("Missing required data to submit review.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          Description: reviewText,
          User: user.user._id,
          Movie: selectedMovie._id,
        }),
      });

      const data = await response.json(); // Parse response

      if (response.ok) {
        console.log("Review submitted successfully:", data);
        fetchMovieReviews(selectedMovie._id); // Refresh reviews
        setShowReviewModal(false);
        setReviewText("");
        setReviewRating(5);
        setSelectedMovie(null); // Reset selection after successful submission
      } else {
        console.error(
          "Failed to submit review:",
          data.message || response.statusText
        );
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleLikeDislike = async (reviewId, action) => {
    try {
      // ✅ Extract `userId` safely
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?.user?._id;

      console.log("Stored user:", storedUser); // Debugging
      console.log("Extracted userId:", userId); // Debugging

      if (!userId) {
        console.error("User not logged in");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/review/${reviewId}/react`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, action }),
        }
      );

      if (!response.ok) throw new Error("Failed to update review");

      const data = await response.json();

      if (data.success) {
        // ✅ Ensure state updates correctly
        setReviewLikes((prev) => ({ ...prev, [reviewId]: data.LikeCount }));
        setReviewDislikes((prev) => ({
          ...prev,
          [reviewId]: data.DislikeCount,
        }));

        setLikedReviews((prev) => ({
          ...prev,
          [reviewId]: action === "like" ? !prev[reviewId] : false,
        }));

        setdislikedReviews((prev) => ({
          ...prev,
          [reviewId]: action === "dislike" ? !prev[reviewId] : false,
        }));
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

  // Format date for history items
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

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
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center text-sm bg-red-600 hover:bg-red-700 py-1 px-3 rounded transition duration-300"
            >
              <FaSignOutAlt className="mr-1" />
              Logout
            </button>
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

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <History size={20} className="mr-2 text-white" />
                  <h2 className="text-lg font-semibold text-white">
                    Watch History
                  </h2>
                </div>
                {userHistory.length > 3 && (
                  <button
                    className="text-xs text-white bg-blue-700 hover:bg-blue-900 px-2 py-1 rounded-full transition-colors"
                    onClick={() => setShowAllHistory(!showAllHistory)}
                  >
                    {showAllHistory ? "Show Less" : "View All"}
                  </button>
                )}
              </div>
            </div>

            {isLoadingHistory ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : userHistory.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {/* Show first 3 items by default, or all items if showAllHistory is true */}
                {(showAllHistory ? userHistory : userHistory.slice(0, 3)).map(
                  (movie, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        // Find the original movie object to navigate to
                        const originalMovie = movies.find(
                          (m) => m._id === movie._id
                        );
                        if (originalMovie) {
                          handleMovieClick(originalMovie);
                        }
                      }}
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-16 rounded overflow-hidden bg-gray-200 flex-shrink-0 shadow-sm">
                          <img
                            src={
                              movie.MovieImage ||
                              "/placeholder.svg?height=64&width=48"
                            }
                            alt={movie.Name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {movie.Name}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {movie.Type}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <Star
                                size={14}
                                className="text-yellow-500 mr-1"
                                fill="currentColor"
                              />
                              <span className="text-xs font-medium">
                              {stats[movie._id]?.averageRating || 0}/5
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <span className="inline-block bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs">
                              {new Date(movie.visitedAt).toLocaleDateString()}
                            </span>
                            <span className="ml-2">
                              {new Date(movie.visitedAt).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}

                {/* Show "View All History" button at the bottom if there are more than 3 items and not showing all */}
                {userHistory.length > 3 && !showAllHistory && (
                  <div className="p-3 bg-gray-50">
                    <button
                      className="w-full py-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center"
                      onClick={() => setShowAllHistory(true)}
                    >
                      <span>View All History</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Show "Show Less" button at the bottom if showing all history */}
                {showAllHistory && userHistory.length > 3 && (
                  <div className="p-3 bg-gray-50">
                    <button
                      className="w-full py-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center"
                      onClick={() => setShowAllHistory(false)}
                    >
                      <span>Show Less</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center">
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
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 mb-2">No watch history yet</p>
                <p className="text-sm text-gray-400">
                  Start watching movies to see them here!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow">
          {/* Movie Recommendations */}
          

          {/* Movie Browse Section */}
          <div>
            <h2 className="text-xl font-bold mb-4">Browse Movies</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMovies.map((movie) => (
              <div key={movie._id} className="bg-white rounded-lg shadow-md overflow-hidden" onClick={() => handleMovieClick(movie)}>
                <div className="h-48 overflow-hidden">
                  <img
                    src={movie.MovieImage || "/placeholder.svg?height=300&width=200"}
                    alt={movie.Name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate">{movie.Name}</h3>
                  <p className="text-sm text-gray-600">{movie.Type}</p>
                  <p className="text-sm text-gray-500">{movie.Description}</p>
                  <div className="flex items-center mt-2">
                    <Star size={16} className="text-yellow-500 mr-1" fill="currentColor" />
                    <span className="text-sm">
                      {stats[movie._id]?.averageRating || 0}/5
                    </span>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <button
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWriteReview(movie);
                      }}
                    >
                      Review
                    </button>
                    <button
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md"
                      onClick={(e) => {
                        e.stopPropagation();
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
                      "/placeholder.svg" ||
                      "/placeholder.svg" ||
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

              <div className="mb-4"></div>

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
                          src={review.User[0]?.ProfileImage || defaultAvatar}
                          alt={review.User[0]?.UserName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900">
                            {review.User[0]?.UserName}
                          </h4>
                          
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
                          className={`flex items-center text-sm ${
                            likedReviews[review._id]
                              ? "text-blue-600"
                              : "text-gray-600"
                          }`}
                          onClick={() => handleLikeDislike(review._id, "like")}
                        >
                          👍 {reviewLikes[review._id] || review.LikeCount} Likes
                        </button>

                        <button
                          className={`flex items-center text-sm ${
                            dislikedReviews[review._id]
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                          onClick={() =>
                            handleLikeDislike(review._id, "dislike")
                          }
                        >
                          👎 {reviewDislikes[review._id] || review.DislikeCount}{" "}
                          Dislikes
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
