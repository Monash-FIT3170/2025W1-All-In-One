import React, { useState, useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { RentalApplications } from "/imports/api/database/collections";

const SharedLease = ({ propId, tenId }) => {
  const [groupId, setGroupId] = useState(null);
  const [joinGroupId, setJoinGroupId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("info"); // 'info' | 'success' | 'error'
  const [rentalAppId, setRentalAppId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Track the rental application for this tenant/property
  const rentalApp = useTracker(() => {
    const handle = Meteor.subscribe("rentalApplications");
    if (!handle.ready()) return null;

    return RentalApplications.findOne({
      prop_id: propId,
      $or: [
        { ten_id: tenId },
        { tenants: { $elemMatch: { ten_id: tenId } } },
      ],
    });
  }, [propId, tenId]);

  useEffect(() => {
    if (rentalApp) {
      setRentalAppId(rentalApp._id);
      setGroupId(rentalApp.shared_lease_id || null);
    } else {
      setRentalAppId(null);
      setGroupId(null);
    }
  }, [rentalApp]);

  // centralised status display
  const showStatus = (message, type = "info") => {
    setStatusMessage(message);
    setStatusType(type);
  };

  // Create a new shared lease group (just sets shared_lease_id on rental application)
  const handleCreateGroup = () => {
    if (!rentalAppId) {
      showStatus("Rental application not found.", "error");
      return;
    }

    setLoading(true);
    Meteor.call("sharedLease.createGroup", tenId, propId, (err, result) => {
      setLoading(false);
      if (err) {
        console.error("sharedLease.createGroup error:", err);
        const msg = err.reason || err.message || "Failed to create group";
        showStatus(`Error: ${msg}`, "error");
        return;
      }

      const newGroupId = String(result);
      setGroupId(newGroupId);
      showStatus("Shared lease group created!", "success");
    });
  };

  // Join an existing shared lease group
  const handleJoinGroup = () => {
    const trimmedId = (joinGroupId || "").trim();
    if (!rentalAppId) {
      showStatus("Rental application not found.", "error");
      return;
    }
    if (!trimmedId) {
      showStatus("Please enter a group ID to join.", "error");
      return;
    }

    setLoading(true);
    Meteor.call("sharedLease.joinGroup", trimmedId, tenId, (err) => {
      setLoading(false);
      if (err) {
        console.error("sharedLease.joinGroup error:", err);
        const msg = err.reason || err.message || "Failed to join group";
        showStatus(`Error: ${msg}`, "error");
      } else {
        setGroupId(trimmedId);
        setJoinGroupId("");
        showStatus("You successfully joined the shared lease group!", "success");
      }
    });
  };

  const statusColorClass =
    statusType === "success"
      ? "text-green-600"
      : statusType === "error"
      ? "text-red-600"
      : "text-gray-600";

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-2">Shared Lease</h3>
      <p className="text-gray-600 text-sm mb-6">
        Join or create a shared lease group for this property.
      </p>

      {groupId ? (
        <div className="mb-4">
          <p className="text-sm text-gray-700">
            Shared Lease Group ID: <span className="font-mono">{groupId}</span>
          </p>
        </div>
      ) : (
        <p className="mb-4 text-gray-500">No shared lease group yet.</p>
      )}

      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={handleCreateGroup}
          disabled={loading}
          className="bg-[#9747FF] text-white px-6 py-2 rounded-full font-semibold hover:bg-violet-900 transition disabled:opacity-60"
        >
          {loading ? "Working..." : "Create Group"}
        </button>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Enter Group ID to Join"
            value={joinGroupId}
            onChange={(e) => setJoinGroupId(e.target.value)}
            disabled={loading}
            className="p-2 border border-gray-300 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-[#9747FF]"
          />
          <button
            type="button"
            onClick={handleJoinGroup}
            disabled={loading}
            className="px-6 py-2 rounded-full font-semibold transition bg-green-600 text-white hover:bg-green-800 disabled:opacity-60"
          >
            {loading ? "Working..." : "Join Group"}
          </button>
        </div>
      </div>

      {statusMessage && (
        <p className={`mt-4 text-sm ${statusColorClass}`}>{statusMessage}</p>
      )}
    </div>
  );
};

export default SharedLease;
