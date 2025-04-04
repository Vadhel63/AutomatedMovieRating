import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { Check, X, UserCheck, ArrowLeft } from "lucide-react";

const ProducerApproval = () => {
  const [pendingProducers, setPendingProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingProducers = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/");
          return;
        }

        const response = await API.get("/user/pending-producers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingProducers(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch pending producers");
        setLoading(false);
      }
    };

    fetchPendingProducers();
  }, [navigate]);

  const handleApproveProducer = async (userId) => {
    try {
      const token = localStorage.getItem("authToken");
      await API.put(
        `/user/approve-producer/${userId}`,
        { status: "Accepted" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the local state to remove approved producer
      setPendingProducers(pendingProducers.filter(producer => producer._id !== userId));
    } catch (err) {
      setError("Failed to approve producer");
    }
  };

  const handleRejectProducer = async (userId) => {
    try {
      const token = localStorage.getItem("authToken");
      await API.put(
        `/user/approve-producer/${userId}`,
        { status: "Rejected" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the local state to remove rejected producer
      setPendingProducers(pendingProducers.filter(producer => producer._id !== userId));
    } catch (err) {
      setError("Failed to reject producer");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate("/admin-dashboard")}
            className="bg-gray-700 p-2 rounded-full mr-3 hover:bg-gray-600 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold flex items-center">
            <UserCheck className="mr-2" size={24} />
            Producer Approval Requests
          </h1>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {pendingProducers.length === 0 ? (
          <div className="bg-gray-700 rounded-lg p-6 text-center">
            <p className="text-lg">No pending producer requests</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingProducers.map((producer) => (
              <div key={producer._id} className="bg-gray-700 rounded-lg p-4 shadow-md">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center mr-3">
                    {producer.ProfileImage ? (
                      <img
                        src={producer.ProfileImage}
                        alt={producer.UserName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-xl">
                        {producer.UserName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{producer.UserName}</h3>
                    <p className="text-gray-400 text-sm">{producer.Email}</p>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-2 rounded mb-3">
                  <p className="text-sm text-gray-300">
                    Request submitted: {new Date(producer.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApproveProducer(producer._id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg flex items-center justify-center transition-all"
                  >
                    <Check size={16} className="mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectProducer(producer._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg flex items-center justify-center transition-all"
                  >
                    <X size={16} className="mr-1" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProducerApproval;