import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { Link } from "react-router-dom";
import {
  Users,
  Activity,
  Calendar,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Bell,
  Search,
  Trash2,
  BarChart2,
} from "lucide-react";

const AdminDashboard = () => {
  const [pendingProducers, setPendingProducers] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showUsersPanel, setShowUsersPanel] = useState(false);
  const [showTrainingPanel, setShowTrainingPanel] = useState(false);
  const [notifications, setNotifications] = useState(3); // Example notification count
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        // Fetch admin profile
        const profileResponse = await API.get("/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmin(profileResponse.data.user);

        // Fetch all users
        const usersResponse = await API.get("/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(usersResponse.data.users);

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);
  useEffect(() => {
    const fetchPendingProducers = async () => {
      try {
        const response = await API.get("/user/pending-producers");
        setPendingProducers(response.data);
      } catch (error) {
        console.error("Error fetching pending producers:", error);
      }
    };

    fetchPendingProducers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const handleDeleteUser = async (userId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (isConfirmed) {
      try {
        const token = localStorage.getItem("authToken");
        await API.delete(`/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.filter((user) => user._id !== userId));
      } catch (err) {
        setError("Failed to delete user.");
      }
    }
  };

  const handleTrainModel = async (timeframe) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await API.post(
        "/admin/train-model",
        { timeframe },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Show success message
      const trainingStatus = document.getElementById("training-status");
      trainingStatus.textContent = `Model trained successfully: ${response.data.message}`;
      trainingStatus.classList.remove("hidden");

      // Hide message after 3 seconds
      setTimeout(() => {
        trainingStatus.classList.add("hidden");
      }, 3000);
    } catch (err) {
      setError("Failed to train model.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div
            className="w-3 h-3 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-3 h-3 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-500 text-white p-4 text-center">{error}</div>;
  }

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
      {/* Main header bar */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and title */}
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg">
              <BarChart2 size={24} className="text-gray-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-xs text-gray-400">Management Console</p>
            </div>
          </div>

          {/* Center - Search bar */}
          <div className="hidden md:flex bg-gray-700 rounded-lg px-3 py-1.5 w-1/3">
            <Search size={18} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search users, reports, or settings..."
              className="bg-transparent text-white placeholder-gray-400 focus:outline-none w-full text-sm"
            />
          </div>

          {/* Right side - Profile and notifications */}
          <div className="flex items-center space-x-4">
            {/* Navigation links */}
            <div className="hidden md:flex space-x-1">
              <button
                onClick={() => {
                  setShowUsersPanel(!showUsersPanel);
                  setShowTrainingPanel(false);
                }}
                className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-all ${
                  showUsersPanel ? "bg-gray-700" : "hover:bg-gray-700"
                }`}
              >
                <Users size={18} />
                <span>Users</span>
              </button>

              <button
                onClick={() => {
                  setShowTrainingPanel(!showTrainingPanel);
                  setShowUsersPanel(false);
                }}
                className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-all ${
                  showTrainingPanel ? "bg-gray-700" : "hover:bg-gray-700"
                }`}
              >
                <Activity size={18} />
                <span>Training</span>
              </button>

              <button
                onClick={() => navigate("/admin/settings")}
                className="px-3 py-2 rounded-lg flex items-center space-x-1 hover:bg-gray-700 transition-all"
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>
            </div>

            {/* Notifications */}
            <button
          className="relative p-2 rounded-full hover:bg-gray-700"
          onClick={() => navigate("/admin/approve-producers")} // Redirect on click
        >
          <Bell size={20} />
          {pendingProducers.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {pendingProducers.length}
            </span>
          )}
        </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-400">
                  <img
                    src={
                      admin?.ProfileImage || "https://via.placeholder.com/150"
                    }
                    alt="Admin"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium leading-none">
                    {admin?.UserName || "Admin"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {admin?.Role || "Administrator"}
                  </p>
                </div>
                <ChevronDown size={16} className="hidden md:block" />
              </button>

              {/* Profile dropdown menu */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-10 text-gray-200">
                  <a
                    href="profile"
                    className="flex items-center px-4 py-2 hover:bg-gray-700"
                  >
                    <User size={16} className="mr-2" />
                    My Profile
                  </a>
                  <a
                    href="/admin/settings"
                    className="flex items-center px-4 py-2 hover:bg-gray-700"
                  >
                    <Settings size={16} className="mr-2" />
                    Settings
                  </a>
                  <hr className="my-1 border-gray-700" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-700 text-red-400"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Users Panel */}
      {showUsersPanel && (
        <div className="border-t border-gray-700 bg-gray-800 py-6 px-4 animate-fadeIn">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Users className="mr-2" size={20} />
                User Management
              </h2>
              <span className="bg-gray-700 text-xs px-2 py-1 rounded-full">
                {users.length} Total Users
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="bg-gray-700 rounded-lg p-4 flex justify-between items-center group hover:bg-gray-600 transition-all"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center mr-3">
                      {user.ProfileImage ? (
                        <img
                          src={user.ProfileImage}
                          alt={user.UserName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="font-medium text-white">
                          {user.UserName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{user.UserName}</p>
                      <p className="text-xs text-gray-400">{user.Email}</p>
                      <span className="text-xs bg-gray-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {user.Role}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expandable Training Panel */}
      {showTrainingPanel && (
        <div className="border-t border-gray-700 bg-gray-800 py-6 px-4 animate-fadeIn">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Activity className="mr-2" size={20} />
                Model Training
              </h2>
              <span className="bg-green-500 text-xs px-2 py-1 rounded-full flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></span>
                System Ready
              </span>
            </div>

            <p
              className="hidden bg-green-500 text-white py-2 px-4 rounded-lg mb-4 text-sm"
              id="training-status"
            >
              Training successful!
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                "1 day",
                "7 days",
                "1 month",
                "1 year",
                "2 years",
                "3 years",
              ].map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => handleTrainModel(timeframe)}
                  className="bg-gray-700 text-white py-3 px-2 rounded-lg hover:bg-gray-600 transition-all flex flex-col items-center justify-center"
                >
                  <Calendar className="mb-1" size={20} />
                  <span className="text-sm">{timeframe}</span>
                </button>
              ))}
            </div>

            <div className="bg-gray-700 rounded-lg p-4 mt-4">
              <h3 className="text-lg font-medium mb-2">Training History</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span>Last trained 2 hours ago</span>
                  </div>
                  <span>1 month data</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span>Trained yesterday</span>
                  </div>
                  <span>1 year data</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span>Trained 3 days ago</span>
                  </div>
                  <span>3 years data</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
