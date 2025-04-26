import axios from "axios";

const API = axios.create({
  baseURL: "https://automatedmovierating.onrender.com", // Replace with your backend URL
});

export default API;
