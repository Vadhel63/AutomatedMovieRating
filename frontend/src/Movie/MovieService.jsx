import axios from "axios";

const API_URL = "https://automatedmovierating.onrender.com/Movie"; // Adjust the URL as needed

const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

const getMovies = () => {
  return axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });
};

const getMovieById = (id) => {
  return axios.get(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });
};

const addMovie = (movie) => {
  return axios.post(API_URL, movie, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });
};

const updateMovie = (id, movie) => {
  return axios.patch(`${API_URL}/${id}`, movie, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });
};

const deleteMovie = (id) => {
  return axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });
};
const searchMovies = (term, token) => {
  return axios.get(`${API_URL}/search?term=${term}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export default {
  getMovies,
  getMovieById,
  addMovie,
  updateMovie,
  deleteMovie,
  searchMovies,
};
