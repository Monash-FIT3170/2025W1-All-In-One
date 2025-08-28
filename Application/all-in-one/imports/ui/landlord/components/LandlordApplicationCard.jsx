import React, { useEffect } from "react";
import { FaBath, FaBed, FaCar, FaCouch } from "react-icons/fa";
import { useState } from "react";
import { Meteor } from "meteor/meteor";
import { ApplicantCard } from "../../agent/components/ApplicantCard";
import LandlordStatusMenu from "./LandlordStatusMenu";

////////////////////////////////////////////////////////////////////////////
// Component used to display the application as a card in the Landlord's application list //
////////////////////////////////////////////////////////////////////////////

export default function LandlordApplicationCard({ application }) {
  const [status, setStatus] = useState(application.status || "");
  useEffect(() => {
    setStatus(application.status || "");
    console.log("Rendering application:", application);
  }, [application.status]);
  return (
    <div className="w-full flex gap-5 h-[200px]">
      <div className="relative bg-[#FFF8E9] rounded-xl shadow-md overflow-hidden w-1/3">
        {/* Background Image */}
        <img
          src={application.property.image}
          alt={application.property.address}
          className="w-full h-[200px] object-cover"
        />

        {/* Overlay Content */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/85 p-4">
          <div className="mt-2 flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-500">
              {application.property.price}{" "}
              <span className="text-sm font-medium text-gray-500">
                per week
              </span>
            </h2>
            <p className="text-gray-600 text-right text-sm">
              {application.property.address}
            </p>
          </div>

          <div className="px-4 pb-4 mt-4 flex justify-between text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <FaBath size={20} />
              <span className="">{application.property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaBed size={20} />
              <span className="">{application.property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCar size={20} />
              <span className="">{application.property.parking}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-2/3 p-8 bg-[#D9D9D9] rounded-xl flex justify-center items-center">
        <div className="flex px-5 py-8 justify-between items-center bg-white rounded-xl w-full h-full">
          <div className="flex flex-col items-start space-y-3">
            <h3 className="text-lg font-bold">
              {application.tenant.firstName} {application.tenant.lastName}
            </h3>
            <p>
              Age: <span>{application.age}</span>
            </p>
            <p>
              Occupation: <span>{application.occupation}</span>
            </p>
          </div>

          {/* Right: Applicant Info Card */}
          <div className="w-3/4 p-8 bg-[#CBADD8] rounded-2xl flex flex-col justify-between">
            {/* Status set */}
            <div className="relative flex items-center gap-3">
              {/* Status menu for accepting/rejecting application */}
              <LandlordStatusMenu
                appId={application._id}
                currentDecision={status}
              />

              {/* Final Decision controls + display */}
              <div className="flex items-center gap-2 ml-3">
                {/* Show final decision icon if set */}

                {status === "Approved" ? (
                  <span
                    title="Final Decision: Approved"
                    className="text-green-600 text-xl"
                  >
                    <img
                      src="/icons/Frame32.png"
                      alt="Green Flag"
                      width={40}
                      height={40}
                    />
                  </span>
                ) : status === "Rejected" ? (
                  <span
                    title="Final Decision: Rejected"
                    className="text-red-600 text-xl"
                  >
                    <img
                      src="/icons/Frame31.png"
                      alt="Green Flag"
                      width={40}
                      height={40}
                    />
                  </span>
                ) : (
                  <span>{status}</span>
                )}
              </div>
            </div>
            {/* }
            /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
