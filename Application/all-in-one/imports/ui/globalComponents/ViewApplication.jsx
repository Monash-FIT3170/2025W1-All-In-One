import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useTracker } from "meteor/react-meteor-data";
import { RentalApplications } from "/imports/api/database/collections";

import GeneralSection from "../tenant/applyPages/GeneralSection";
import PersonalDetails from "../tenant/applyPages/PersonalDetails";
import AboutMe from "../tenant/applyPages/AboutMe";
import AddressHistory from "../tenant/applyPages/AddressHistory";
import Employment from "../tenant/applyPages/Employment";
import Income from "../tenant/applyPages/Income";
import Identity from "../tenant/applyPages/Identity";
import Household from "../tenant/applyPages/Household";
import SharedLease from "../tenant/applyPages/SharedLease";

function ViewApplication() {
  const { appId } = useParams();
  const containerRef = useRef(null);

  const rentalApplication = useTracker(() => {
    Meteor.subscribe("rentalApplications");
    return RentalApplications.findOne({ _id: appId });
  }, [appId]);

  // 🔒 After render, disable all inputs/textareas/selects inside the container
  useEffect(() => {
    if (containerRef.current) {
      const formElements = containerRef.current.querySelectorAll(
        "input, textarea, select, button"
      );
      formElements.forEach((el) => {
        el.setAttribute("disabled", "true");
        el.classList.add("cursor-not-allowed", "bg-gray-100", "text-gray-700");
      });
    }
  }, [rentalApplication]);

  if (!rentalApplication) {
    return <div>Loading application...</div>;
  }

  const sectionList = [
    "General",
    "Personal Details",
    "About Me",
    "Address History",
    "Employment",
    "Income",
    "Identity",
    "Household",
    "Shared Lease",
  ];

  const sharedProps = { 
    propId: rentalApplication.prop_id, 
    tenId: rentalApplication.ten_id,
  };

  const renderFormSection = (section) => {
    switch (section) {
      case "General":
        return <GeneralSection {...sharedProps} />;
      case "Personal Details":
        return <PersonalDetails {...sharedProps} />;
      case "About Me":
        return <AboutMe {...sharedProps} />;
      case "Address History":
        return <AddressHistory {...sharedProps} />;
      case "Employment":
        return <Employment {...sharedProps} />;
      case "Income":
        return <Income {...sharedProps} />;
      case "Identity":
        return <Identity {...sharedProps} />;
      case "Household":
        return <Household {...sharedProps} />;
      case "Shared Lease":
        return <SharedLease {...sharedProps} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="p-8 bg-[#FFF8E9] min-h-screen" ref={containerRef}>
        <h1 className="text-2xl font-bold mb-4">Agent View - Application</h1>
        <p className="mb-6 text-gray-600">
          Viewing application for Property: {rentalApplication.prop_id}
        </p>

        {sectionList.map((section, idx) => (
          <div key={idx} className="mb-10 bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">{section}</h2>
            {renderFormSection(section)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ViewApplication;

