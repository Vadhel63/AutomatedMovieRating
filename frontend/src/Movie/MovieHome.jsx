import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MovieService from "./MovieService";
import {
  Search,
  Film,
  Plus,
  Edit,
  Trash2,
  Loader,
  MessageSquare,
  BarChart,
} from "lucide-react";

const MovieHome = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/"); // Redirect to login if not authenticated
    } else {
      const userData = JSON.parse(atob(token.split(".")[1])); // Decode the token
      if (userData.role !== "Producer") {
        navigate("/home"); // Redirect to home if not a Producer
      } else {
        fetchMovies();
      }
    }
  }, [navigate]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const response = await MovieService.getMovies();
      setMovies(response.data.movies);
      setSearchResults(response.data.movies); // Initialize search results with all movies
    } catch (error) {
      console.error("Failed to fetch movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMovie = () => {
    navigate("/MovieForm");
  };

  const handleEditMovie = (movieId) => {
    navigate(`/MovieForm/${movieId}`);
  };

  const handleDeleteMovie = async (movieId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this movie?"
    );
    if (isConfirmed) {
      try {
        await MovieService.deleteMovie(movieId);
        fetchMovies(); // Refresh the list after deletion
      } catch (error) {
        console.error("Failed to delete movie:", error);
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults(movies); // Reset to all movies if search term is empty
      return;
    }

    setIsSearching(true);
    try {
      const token = localStorage.getItem("authToken"); // Retrieve the token
      const response = await MovieService.searchMovies(searchTerm, token); // Pass the token
      setSearchResults(response.data.movies);
    } catch (error) {
      console.error("Failed to search movies:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewMovie = (movieId) => {
    navigate(`/MovieDetails/${movieId}`); // Navigate to the movie details page
  };

  const handleViewReviews = (movieId, movieName) => {
    navigate(`/MovieReviews/${movieId}`, { state: { movieName } });
  };

  const handleViewStatistics = (movieId, movieName) => {
    navigate(`/MovieReviewStats/${movieId}`, { state: { movieName } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white p-6">
      {/* Header with search */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center">
            <Film className="mr-2 text-indigo-400 animate-pulse" />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Movie Dashboard
            </h1>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </form>

          {/* Add movie button with animation */}
          <button
            onClick={handleAddMovie}
            className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
          >
            <Plus size={18} />
            <span>Add Movie</span>
          </button>
        </div>

        {/* Movie grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin text-indigo-400" size={48} />
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((movie) => (
              <div
                key={movie._id}
                className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1 border border-gray-700 cursor-pointer"
                onClick={() => handleViewMovie(movie._id)} // Add click handler
              >
                <div className="h-48 w-full flex items-center justify-center overflow-hidden rounded-lg">
                  {movie.MovieImage ? (
                    <img
                      src={movie.MovieImage}
                      alt={movie.Name}
                      className="h-full w-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-r from-purple-800 to-indigo-800 flex items-center justify-center">
                      <Film size={64} className="text-white opacity-50" />
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h2 className="text-xl font-bold mb-2 text-indigo-300">
                    {movie.Name}
                  </h2>
                  <p className="text-gray-300 mb-4 line-clamp-3">
                    {movie.Description}
                  </p>

                  <div className="flex flex-wrap gap-2 justify-between items-center mb-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click event
                        handleEditMovie(movie._id);
                      }}
                      className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 py-1.5 px-3 rounded-lg transition-colors duration-200"
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click event
                        handleDeleteMovie(movie._id);
                      }}
                      className="flex items-center gap-1 bg-red-600 hover:bg-red-500 py-1.5 px-3 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click event
                        handleViewReviews(movie._id, movie.Name);
                      }}
                      className="flex items-center justify-center gap-1 bg-purple-600 hover:bg-purple-500 py-1.5 px-3 rounded-lg transition-colors duration-200"
                    >
                      <MessageSquare size={16} />
                      <span>Reviews</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click event
                        handleViewStatistics(movie._id, movie.Name);
                      }}
                      className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 py-1.5 px-3 rounded-lg transition-colors duration-200"
                    >
                      <BarChart size={16} />
                      <span>Stats</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-400">
              No movies found. Add some or try a different search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieHome;
