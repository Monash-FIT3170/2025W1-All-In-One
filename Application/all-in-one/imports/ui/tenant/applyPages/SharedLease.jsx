import React, { useState, useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { RentalApplications } from "/imports/api/database/collections";

const SharedLease = ({ propId, tenId }) => {
  const [groupId, setGroupId] = useState(null);
  const [joinGroupId, setJoinGroupId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [rentalAppId, setRentalAppId] = useState(null);

const rentalApp = useTracker(() => {
  const handle = Meteor.subscribe("rentalApplications");
  if (!handle.ready()) return null;

  return RentalApplications.findOne({
    prop_id: propId,
    $or: [
      { ten_id: tenId }, // case 1: tenant stored directly
      { tenants: { $elemMatch: { ten_id: tenId } } }, // case 2: tenant stored in array
    ],
  });
}, [propId, tenId]);


useEffect(() => {
  console.log("Rental application doc:", rentalApp);
  if (rentalApp) {
    setRentalAppId(rentalApp._id);
    if (rentalApp.shared_lease_id) {
      setGroupId(rentalApp.shared_lease_id);
    }
  }
}, [rentalApp]);


  // Create a new shared lease group
  const handleCreateGroup = () => {
    if (!rentalAppId) {
      setStatusMessage("Rental application not found.");
      return;
    }

    Meteor.call("sharedLease.createGroup", tenId, propId, (err, result) => {
      if (err) {
        setStatusMessage(`Error creating lease group: ${err.message}`);
      } else {
        const newGroupId = String(result);
        setGroupId(newGroupId);
        setStatusMessage("New shared lease group created!");

        Meteor.call("rentalApplications.update", rentalAppId, { shared_lease_id: newGroupId }, (err2) => {
          if (err2) console.error("Error updating rental application:", err2);
        });
      }
    });
  };

  // Join an existing shared lease group using input
  const handleJoinGroup = () => {
    console.log("Joining group:", joinGroupId);
    console.log("rental id:", rentalAppId);

    if (!rentalAppId) {
      setStatusMessage("Rental application not found.");
      return;
    }
    if (!joinGroupId) {
      setStatusMessage("Please enter a group ID to join.");
      return;
    }

    Meteor.call("sharedLease.joinGroup", joinGroupId, tenId, (err) => {
      if (err) {
        setStatusMessage(`Error joining lease group: ${err.message}`);
      } else {
        setGroupId(joinGroupId);
        setStatusMessage("You successfully joined the shared lease group!");

        // always update rental application
        Meteor.call("rentalApplications.update", rentalAppId, { shared_lease_id: joinGroupId }, (err2) => {
          if (err2) console.error("Error updating rental application:", err2);
        });
      }
    });
  };


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
          className="bg-[#9747FF] text-white px-6 py-2 rounded-full font-semibold hover:bg-violet-900 transition"
        >
          Create Group
        </button>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Enter Group ID to Join"
            value={joinGroupId}
            onChange={(e) => setJoinGroupId(e.target.value)}
            className="p-2 border border-gray-300 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-[#9747FF]"
          />
          <button
            type="button"
            onClick={handleJoinGroup}
            className={`px-6 py-2 rounded-full font-semibold transition bg-green-600 text-white hover:bg-green-800`}
          >
            Join Group
          </button>
        </div>
      </div>

      {statusMessage && (
        <p className="mt-4 text-sm text-green-600">{statusMessage}</p>
      )}
    </div>
  );
};

export default SharedLease;
