import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleGoBack}
            className="bg-indigo-800 hover:bg-indigo-700 p-2 rounded-full transition-colors duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center">
            <Film className="mr-2 text-indigo-400" />
            <h1 className="text-3xl font-bold text-white">
              Reviews for {movieName || "Movie"}
            </h1>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin text-indigo-400" size={48} />
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-700 p-4 rounded-lg text-center">
            <p>{error}</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg hover:shadow-indigo-500/20 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-700 rounded-full p-2">
                      <User className="text-white" size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-indigo-300">
                        {review.User[0]?.UserName || "Anonymous User"}
                      </h3>
                      <span className="text-sm text-gray-400">
                        {formatDate(review.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div>{(review.Description)}</div>
                </div>
                {/* <p className="text-gray-300">{review.Comment}</p> */}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl p-8 text-center shadow-lg">
            <p className="text-gray-400">No reviews found for this movie.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieReviews;
