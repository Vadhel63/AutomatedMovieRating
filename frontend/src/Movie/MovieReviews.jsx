import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Film, ArrowLeft, Loader, Star, User } from "lucide-react";
import API from "../api";

const MovieReviews = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { movieName } = location.state || {};
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/");
          return;
        }

        const response = await API.get(`/review/Movie/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data.reviews);
        setReviews(response.data.reviews || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Failed to load reviews. Please try again.");
        setLoading(false);
      }
    };

    fetchReviews();
  }, [id, navigate]);

  const handleGoBack = () => {
    navigate(-1);
  };

  // Function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="fill-yellow-400 text-yellow-400"
          size={18}
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="relative">
          <Star className="text-gray-400" size={18} />
          <Star
            className="absolute top-0 left-0 fill-yellow-400 text-yellow-400 overflow-hidden w-1/2"
            size={18}
          />
        </span>
      );
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="text-gray-400" size={18} />
      );
    }

    return <div className="flex">{stars}</div>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown Date"; // Handle missing values
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date"; // Handle invalid dates
    return date.toLocaleDateString(); // Format properly
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with animated gradient border */}
        <div className="mb-8 relative overflow-hidden rounded-2xl p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-xl">
            <button
              onClick={handleGoBack}
              className="bg-indigo-700 hover:bg-indigo-600 p-2 rounded-full transition-colors duration-200 shadow-lg"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center">
              <Film className="mr-3 text-indigo-400" size={24} />
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
                Reviews for {movieName || "Movie"}
              </h1>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <Loader className="animate-spin text-indigo-400" size={48} />
            <p className="text-indigo-300 animate-pulse">Loading reviews...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-700 p-6 rounded-lg text-center shadow-lg">
            <p className="text-red-300">{error}</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-xl hover:shadow-indigo-500/20 hover:border-indigo-500/30 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full p-3 shadow-lg">
                      <User className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-indigo-300">
                        {review.User[0]?.UserName || "Anonymous User"}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-400 ml-2">
                          ({review.rating})
                        </span>
                      </div>
                      <span className="text-sm text-gray-400 block mt-1">
                        {formatDate(review.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 mt-2 md:mt-0 shadow-inner">
                    <p className="text-gray-200 italic">{review.Description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg border border-gray-700/50">
            <Film className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400 text-lg">
              No reviews found for this movie.
            </p>
            <p className="text-gray-500 mt-2">
              Be the first to share your thoughts!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieReviews;
