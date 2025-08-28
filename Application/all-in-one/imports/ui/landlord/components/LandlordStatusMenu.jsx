import React, { useState } from "react";

const LandlordStatusMenu = ({ appId, currentDecision }) => {
  const [decision, setDecision] = useState(currentDecision || "");
  const [loading, setLoading] = useState(false);

  const handleDecision = (value) => {
    setLoading(true);
    Meteor.call("rentalApplications.setStatus", appId, value, (err) => {
      setLoading(false);
      if (err) {
        alert("Error saving decision: " + err.reason);
      } else {
        setDecision(value);
      }
    });
  };

  return (
    <div className="relative">
      <select
        value={decision}
        onChange={(e) => handleDecision(e.target.value)}
        disabled={loading}
        className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 cursor-pointer"
      >
        <option value="">Select...</option>
        <option value="Approved">Accept</option>
        <option value="Rejected">Reject</option>
      </select>
      {loading && <span className="ml-2 text-sm text-gray-500">Saving...</span>}
    </div>
  );
};

export default LandlordStatusMenu;
