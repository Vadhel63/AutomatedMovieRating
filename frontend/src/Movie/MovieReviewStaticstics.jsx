import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, BarChart, Film, Loader, Star } from "lucide-react";
import API from "../api";

const MovieReviewStats = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { movieName } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    distribution: {
      "1-2": 0,
      "2-3": 0,
      "3-4": 0,
      "4-5": 0,
    },
  });

  useEffect(() => {
    const fetchReviewStats = async () => {
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

        const reviews = response.data.reviews || [];
        calculateStats(reviews);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching review statistics:", err);
        setError("Failed to load review statistics. Please try again.");
        setLoading(false);
      }
    };

    fetchReviewStats();
  }, [id, navigate]);

  const calculateStats = (reviews) => {
    // Calculate total reviews
    const totalReviews = reviews.length;

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => {
      return sum + (review.rating || 0);
    }, 0);
    const avgRating =
      totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;

    // Calculate distribution
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

    setStats({
      totalReviews,
      averageRating: avgRating,
      distribution,
    });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="fill-yellow-400 text-yellow-400"
          size={24}
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="relative">
          <Star className="text-gray-400" size={24} />
          <Star
            className="absolute top-0 left-0 fill-yellow-400 text-yellow-400 overflow-hidden w-1/2"
            size={24}
          />
        </span>
      );
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="text-gray-400" size={24} />
      );
    }

    return <div className="flex">{stars}</div>;
  };

  // Find maximum value in the distribution for scaling
  const maxDistributionValue = Math.max(
    ...Object.values(stats.distribution),
    1
  );

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
            <BarChart className="mr-2 text-indigo-400" />
            <h1 className="text-3xl font-bold text-white">
              {movieName || "Movie"} Rating Statistics
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
        ) : (
          <div className="space-y-8">
            {/* Summary Card */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h2 className="text-lg text-gray-400 mb-1">Total Reviews</h2>
                  <p className="text-4xl font-bold text-white">
                    {stats.totalReviews}
                  </p>
                </div>

                <div className="text-center">
                  <h2 className="text-lg text-gray-400 mb-1">Average Rating</h2>
                  <div className="flex items-center justify-center">
                    <p className="text-4xl font-bold text-white mr-2">
                      {stats.averageRating}
                    </p>
                    <span className="text-gray-400">/5</span>
                  </div>
                  <div className="mt-2">
                    {renderStars(parseFloat(stats.averageRating))}
                  </div>
                </div>
              </div>
            </div>

            {/* Distribution Chart */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
              <h2 className="text-xl font-bold mb-6">Rating Distribution</h2>

              <div className="space-y-6">
                {Object.entries(stats.distribution).map(([range, count]) => (
                  <div key={range} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-indigo-300">
                        {range} Stars
                      </span>
                      <span className="text-gray-400">{count} reviews</span>
                    </div>
                    <div className="h-8 bg-gray-700 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center pl-3 transition-all duration-500 ease-in-out"
                        style={{
                          width: `${(count / maxDistributionValue) * 100}%`,
                          minWidth: count > 0 ? "40px" : "0",
                        }}
                      >
                        {count > 0 && (
                          <span className="text-white font-medium">
                            {count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {stats.totalReviews === 0 && (
              <div className="bg-gray-800 rounded-xl p-8 text-center shadow-lg">
                <Film className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-400">
                  No reviews available for this movie yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieReviewStats;
