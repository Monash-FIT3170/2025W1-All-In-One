// ApplicantCard.jsx
import React from 'react';
import { Meteor } from "meteor/meteor";

export const ApplicantCard = ({ appId, name, desc, status, statusIcon, editButton, submitted, viewButton }) => {
    // Function to map agent-specific statuses to tenant-appropriate ones
    const getTenantStatus = (status) => {
        if (!status) return "Pending";
        
        // Agent-specific statuses that should be hidden from tenants
        if (status === "Shortlisted" || status === "Flagged" || status === "To be Reviewed") {
            return "Pending"; // Show as pending to tenants
        }
        
        // Handle withdrawn status
        if (status === "Withdrawn" && submitted) {
            return "Pending";
        }
        
        // Return the original status for approved/rejected/pending
        return status;
    };

    // ✅ Compute display status
    const displayStatus = getTenantStatus(status);

    return (
        <div className="bg-white rounded-lg shadow w-full h-full flex flex-col justify-center px-10 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-semibold text-lg">{name}</p>
                    <p className="text-sm text-gray-600">{desc}</p>
                </div>
                <div className="text-center">
                    <div className="inline-block px-3 py-1 text-sm font-semibold rounded-full">
                        {statusIcon}
                    </div>
                    <span
                        className={`inline-block px-3 py-1 mt-1 text-sm font-semibold rounded-full ${
                            displayStatus === "Approved"
                                ? "bg-green-200 text-green-800"
                                : displayStatus === "Rejected"
                                ? "bg-red-200 text-red-800"
                                : displayStatus === "Withdrawn"
                                ? "bg-gray-200 text-gray-800"
                                : "bg-yellow-200 text-yellow-800"
                        }`}
                    >
                        {displayStatus}
                    </span>
                </div>
            </div>

            <div className="flex justify-between items-center mt-auto font-semibold pt-2">
<button
  className="rounded-full bg-gray-200 px-3 py-1 text-sm"
  onClick={() => {
    // 1️⃣ Set submitted to false
    Meteor.call("rentalApplications.update", appId, { submitted: false }, (err) => {
      if (err) {
        alert(err.reason || "Error withdrawing application");
        return;
      }

      // 2️⃣ Set status to Withdrawn
      Meteor.call("rentalApplications.setStatus", appId, "Withdrawn", (err2) => {
        if (err2) {
          alert(err2.reason || "Error updating status");
          return;
        }

        // 3️⃣ Unset landlord decision using the new dedicated method
        Meteor.call("rentalApplications.unsetLandlordFinal", appId, (err3) => {
          if (err3) {
            alert(err3.reason || "Error clearing landlord decision");
          } else {
            alert("Application withdrawn successfully and landlord decision cleared!");
          }
        });
      });
    });
  }}
>
  Withdraw Application
</button>



                <p className="text-sm text-gray-600">{editButton}{viewButton}</p>
            </div>
        </div>
    );
};
