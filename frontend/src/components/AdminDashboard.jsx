"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api"
import {
  Users,
  Activity,
  User,
  LogOut,
  Bell,
  Trash2,
  BarChart2,
  TrendingUp,
  UserPlus,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Mail,
  Phone,
} from "lucide-react"

const AdminDashboard = () => {
  const [pendingProducers, setPendingProducers] = useState([])
  const [admin, setAdmin] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [activeTab, setActiveTab] = useState("users")
  const [notifications, setNotifications] = useState(3)
  const navigate = useNavigate()

  // Mock data for dashboard stats
  const stats = [
    { title: "Total Users", value: users.length, icon: Users, color: "bg-blue-500" },
    { title: "Active Today", value: Math.floor(users.length * 0.7), icon: CheckCircle, color: "bg-green-500" },
    { title: "New This Week", value: Math.floor(users.length * 0.2), icon: UserPlus, color: "bg-purple-500" },
    { title: "Pending Approvals", value: pendingProducers.length, icon: Clock, color: "bg-amber-500" },
  ]

  // Mock data for recent activities
  const recentActivities = [
    { user: "John Doe", action: "logged in", time: "2 minutes ago", icon: User },
    { user: "Sarah Smith", action: "updated profile", time: "1 hour ago", icon: User },
    { user: "Mike Johnson", action: "uploaded a document", time: "3 hours ago", icon: User },
    { user: "Emily Davis", action: "requested approval", time: "5 hours ago", icon: User },
    { user: "Robert Wilson", action: "created a new account", time: "1 day ago", icon: UserPlus },
  ]

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("authToken")
      if (!token) {
        navigate("/")
        return
      }

      try {
        // Fetch admin profile
        const profileResponse = await API.get("/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setAdmin(profileResponse.data.user)

        // Fetch all users
        const usersResponse = await API.get("/user", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUsers(usersResponse.data.users)

        setLoading(false)
      } catch (err) {
        setError("Failed to fetch data")
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  useEffect(() => {
    const fetchPendingProducers = async () => {
      try {
        const response = await API.get("/user/pendings")
        console.log("Fetched pending producers:", response.data)
        setPendingProducers(response.data)
      } catch (error) {
        console.error("Error fetching pending producers:", error)
      }
    }

    fetchPendingProducers()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    navigate("/")
  }

  const handleDeleteUser = async (userId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this user?")
    if (isConfirmed) {
      try {
        const token = localStorage.getItem("authToken")
        await API.delete(`/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUsers(users.filter((user) => user._id !== userId))
      } catch (err) {
        setError("Failed to delete user.")
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
          <p className="text-white font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500 text-white p-6 text-center rounded-lg shadow-lg max-w-md mx-auto mt-20">
        <AlertCircle className="mx-auto mb-4" size={48} />
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-white text-red-500 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main header bar */}
      <div className="border-b border-gray-700 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and title */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
                <BarChart2 size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-xs text-gray-400">Management Console</p>
              </div>
            </div>

            {/* Right side - Profile and notifications */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button
                className="relative p-2 rounded-full hover:bg-gray-700 transition-colors"
                onClick={() => navigate("/admin/approve-producers")}
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
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-400 shadow-lg">
                    <img
                      src={admin?.ProfileImage || "https://via.placeholder.com/150"}
                      alt="Admin"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium leading-none">{admin?.UserName || "Admin"}</p>
                    <p className="text-xs text-gray-400">{admin?.Role || "Administrator"}</p>
                  </div>
                  <ChevronDown size={16} className="hidden md:block" />
                </button>

                {/* Profile dropdown menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl py-1 z-10 text-gray-200 border border-gray-700">
                    <a href="profile" className="flex items-center px-4 py-2 hover:bg-gray-700 transition-colors">
                      <User size={16} className="mr-2" />
                      My Profile
                    </a>
                    <hr className="my-1 border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-red-400"
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
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Dashboard Tabs */}

        {/* Users Tab Content */}
        {activeTab === "users" && (
          <div className="animate-fadeIn">
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Users className="mr-2" size={20} />
                    User Management
                  </h2>
                  <span className="bg-gray-700 text-xs px-2 py-1 rounded-full">{users.length} Total Users</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 max-h-[600px] overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="bg-gray-700 rounded-lg p-4 flex flex-col group hover:bg-gray-600 transition-all border border-gray-600 hover:border-gray-500"
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center mr-3 border-2 border-gray-500">
                        {user.ProfileImage ? (
                          <img
                            src={user.ProfileImage || "/placeholder.svg"}
                            alt={user.UserName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="font-medium text-white text-lg">
                            {user.UserName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-lg">{user.UserName}</p>
                        <div className="flex items-center">
                          <span className="text-xs bg-blue-500 px-2 py-0.5 rounded-full inline-block mr-2">
                            {user.Role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-300 mb-3">
                      <div className="flex items-center">
                        <Mail size={14} className="mr-2 text-gray-400" />
                        <span>{user.Email || "email@example.com"}</span>

                        <div className="ml-auto">
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
