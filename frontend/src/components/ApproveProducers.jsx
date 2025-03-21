import React, { useEffect, useState } from "react";
import API from "../api";

const ApproveProducers = () => {
  const [pendingProducers, setPendingProducers] = useState([]);

  useEffect(() => {
    const fetchPendingProducers = async () => {
      try {
        const response = await API.get("/user/pending-producers");
        setPendingProducers(response.data);
      } catch (error) {
        console.error("Error fetching producers:", error);
      }
    };

    fetchPendingProducers();
  }, []);

  const handleAction = async (id, action) => {
    try {
      await API.patch(`/user/update-producer/${id}`, { action });
      setPendingProducers((prev) => prev.filter((producer) => producer._id !== id));
    } catch (error) {
      console.error("Error updating producer status:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold">Approve Producers</h2>

      {pendingProducers.length === 0 ? (
        <p>No pending producers.</p>
      ) : (
        <table className="w-full mt-4 border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Username</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingProducers.map((producer) => (
              <tr key={producer._id} className="border">
                <td className="p-2 border">{producer.UserName}</td>
                <td className="p-2 border">{producer.Email}</td>
                <td className="p-2 border flex gap-4 justify-center">
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
                    onClick={() => handleAction(producer._id, "Accept")}
                  >
                    Accept
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                    onClick={() => handleAction(producer._id, "Reject")}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ApproveProducers;
