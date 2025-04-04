"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api";
import { AlertCircle, ArrowRight, Lock, Mail } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Email: "",
    Password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await API.post(
        "http://localhost:5000/user/login",
        formData
      );
      localStorage.setItem("authToken", response.data.token);
      setError("");
      navigate("/home");
    } catch (err) {
      console.log("Full error:", err);
  const backendMsg =
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.message;
  setError(backendMsg || "Login failed!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Login
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  name="Email"
                  placeholder="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition duration-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  name="Password"
                  placeholder="Password"
                  value={formData.Password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 transform hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <span className="flex items-center justify-center">
                {isLoading ? "Logging in..." : "Login"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </span>
            </button>
          </form>
        </div>

        <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 hover:underline font-medium transition duration-200"
            >
              Signup here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
