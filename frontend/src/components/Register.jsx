import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaTheaterMasks,
  FaVideo,
} from "react-icons/fa";
import API from "../api";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    UserName: "",
    Email: "",
    Password: "",
    Role: "User",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // Check for existing user account with the same email first
      const checkUser = await API.post("/user/check-email", { Email: formData.Email });
      
      if (checkUser.data.exists && formData.Role === "Producer") {
        setError("You already have an account. Please login instead.");
        setIsLoading(false);
        return;
      }
      
      const response = await API.post("/user/signup", formData);
      
      setIsLoading(false);
      
      if (formData.Role === "Producer") {
        setSuccess("Your producer account request has been submitted for admin approval. You'll be notified once approved.");
      } else {
        setSuccess("Account created successfully!");
        // Save the token if provided in response
        if (response.data.token) {
          localStorage.setItem("authToken", response.data.token);
        }
        // Redirect to home/login after a short delay for regular users
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || "Registration failed!");
      setSuccess("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 border border-gray-200">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Join Movie App
          </h2>
          <p className="text-gray-600 mb-6">
            Create your account and start your movie journey
          </p>

          {error && (
            <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p className="font-medium">Registration Error</p>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
              <p className="font-medium">Success!</p>
              <p>{success}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="UserName"
            >
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="UserName"
                name="UserName"
                type="text"
                value={formData.UserName}
                onChange={handleChange}
                required
                className="pl-10 appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Choose a username"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="Email"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="Email"
                name="Email"
                type="email"
                value={formData.Email}
                onChange={handleChange}
                required
                className="pl-10 appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="Password"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="Password"
                name="Password"
                type="password"
                value={formData.Password}
                onChange={handleChange}
                required
                className="pl-10 appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Create a secure password"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              I want to join as:
            </label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div
                className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-all ${
                  formData.Role === "User"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, Role: "User" }))
                }
              >
                <FaTheaterMasks className="h-10 w-10 text-blue-500 mb-2" />
                <p className="font-medium text-gray-800">User</p>
                <p className="text-xs text-gray-500 text-center mt-1">
                  Watch and review movies
                </p>
                <input
                  type="radio"
                  name="Role"
                  value="User"
                  checked={formData.Role === "User"}
                  onChange={handleChange}
                  className="mt-2"
                />
              </div>

              <div
                className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-all ${
                  formData.Role === "Producer"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, Role: "Producer" }))
                }
              >
                <FaVideo className="h-10 w-10 text-purple-500 mb-2" />
                <p className="font-medium text-gray-800">Producer</p>
                <p className="text-xs text-gray-500 text-center mt-1">
                  Add and manage movies
                </p>
                <input
                  type="radio"
                  name="Role"
                  value="Producer"
                  checked={formData.Role === "Producer"}
                  onChange={handleChange}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {formData.Role === "Producer" && (
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-amber-700 text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Producer accounts require admin approval before activation.
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;