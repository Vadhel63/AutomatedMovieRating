import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // For redirection
import API from "../api"; // Axios instance for API calls
import { motion } from "framer-motion"; // For animations
import Header from "./Header";
const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(""); // For storing error messages
  const [loading, setLoading] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({
    UserName: "",
    Email: "",
    Role: "",
    ProfileImage: "",
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No token found. Please login again.");
        setLoading(false);
        return;
      }

      try {
        const response = await API.get("http://localhost:5000/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user);
        setUpdatedUser(response.data.user);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch profile.");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    const formData = new FormData();
    formData.append("UserName", updatedUser.UserName || user.UserName);
    formData.append("Email", updatedUser.Email || user.Email);
    formData.append("Role", updatedUser.Role || user.Role);
    if (updatedUser.ProfileImage) {
      formData.append("ProfileImage", updatedUser.ProfileImage);
    }

    try {
      const response = await API.put(`/user/${user._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(response.data.user);
      setUpdatedUser(response.data.user);
      setShowUpdateForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user profile.");
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("authToken");

    try {
      await API.delete(`/user/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("authToken");
      navigate("/signup");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user account.");
    }
  };

  const handleFileChange = (e) => {
    setUpdatedUser({ ...updatedUser, ProfileImage: e.target.files[0] });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
  
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => navigate("")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-r from-gray-900 to-indigo-900 text-white p-6 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="absolute top-6 left-6">
    <button
      onClick={() => navigate(-1)}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
    >
      ← Go Back
    </button>
  </div>
  
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm w-full transform transition duration-500 hover:scale-105">
        <div className="text-center mb-4">
          <motion.img
            src={user.ProfileImage || "default-avatar.png"}
            alt="Profile"
            className="w-24 h-24 rounded-full mx-auto shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          />
          <h2 className="text-2xl font-bold mt-2 text-blue-900">
            {user.UserName}
          </h2>
          <p className="text-gray-600">{user.Email}</p>
          <p className="text-blue-500">{user.Role}</p>
        </div>

        <div className="space-y-2">
          <motion.button
            onClick={() => setShowUpdateForm(true)}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transform transition duration-300 hover:scale-105"
            whileHover={{ scale: 1.1 }}
          >
            Update Profile
          </motion.button>

          <motion.button
            onClick={() => setConfirmDelete(true)}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transform transition duration-300 hover:scale-105"
            whileHover={{ scale: 1.1 }}
          >
            Delete Account
          </motion.button>
        </div>

        {showUpdateForm && (
          <motion.form
            onSubmit={handleUpdate}
            className="mt-4 space-y-4 bg-gray-50 p-4 rounded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                UserName:
              </label>
              <input
                type="text"
                value={updatedUser.UserName}
                onChange={(e) =>
                  setUpdatedUser({ ...updatedUser, UserName: e.target.value })
                }
                className="mt-1 block w-full text-black border border-gray-300 rounded py-2 px-3 focus:ring focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email:
              </label>
              <input
                type="email"
                value={updatedUser.Email}
                onChange={(e) =>
                  setUpdatedUser({ ...updatedUser, Email: e.target.value })
                }
                className="mt-1 block w-full text-black border border-gray-300 rounded py-2 px-3 focus:ring focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Profile Image:
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="mt-1 block w-full border text-black border-gray-300 rounded py-2 px-3 focus:ring focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transform transition duration-300 hover:scale-105"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setShowUpdateForm(false)}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 mt-2"
            >
              Cancel
            </button>
          </motion.form>
        )}

        {confirmDelete && (
          <motion.div
            className="mt-4 bg-red-50 p-4 rounded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-red-500 text-sm">
              Are you sure you want to delete your account?
            </p>
            <div className="flex space-x-4 mt-2">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transform transition duration-300 hover:scale-105"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ProfilePage;
