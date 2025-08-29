import React, { useState } from 'react';
import GeneralSection from './applyPages/GeneralSection';
import PersonalDetails from './applyPages/PersonalDetails';
import AboutMe from './applyPages/AboutMe';
import AddressHistory from './applyPages/AddressHistory';
import Employment from './applyPages/Employment';
import Income from './applyPages/Income';
import Identity from './applyPages/Identity';
import Household from './applyPages/Household';
import SharedLease from './applyPages/SharedLease';
import Navbar from './components/TenNavbar';
import Footer from './components/Footer';
import { useLocation, useParams } from "react-router-dom";
import {RentalApplications} from '/imports/api/database/collections';
import { useTracker } from 'meteor/react-meteor-data';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}


function Apply() {
  const { id } = useParams();
  const query = useQuery();
  const tenantId = query.get("tenantId");

  console.log("Property ID:", id);
  console.log("Tenant ID:", tenantId);

  const rentalApplication = useTracker(() => {
    Meteor.subscribe('rentalApplications');
    return RentalApplications.findOne({ prop_id: id, ten_id: tenantId });
  }, [id, tenantId]);

  console.log("Rental application:", rentalApplication);

  const sectionList = [
    'General',
    'Personal Details',
    'About Me',
    'Address History',
    'Employment',
    'Income',
    'Identity',
    'Household',
    'Shared Lease',
  ];

  const [activeSection, setActiveSection] = useState(sectionList[0]);
  const currentIndex = sectionList.indexOf(activeSection);
  const goNext = () => {
    if (currentIndex < sectionList.length - 1) {
      setActiveSection(sectionList[currentIndex + 1]);
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setActiveSection(sectionList[currentIndex - 1]);
    }
  };

  const renderFormSection = () => {
  const sharedProps = { propId: id, tenId: tenantId };

  switch (activeSection) {
    case 'General':
      return <GeneralSection {...sharedProps} />;
    case 'Personal Details':
      return <PersonalDetails {...sharedProps} />;
    case 'About Me':
      return <AboutMe {...sharedProps} />;
    case 'Address History':
      return <AddressHistory {...sharedProps} />;
    case 'Employment':
      return <Employment {...sharedProps} />;
    case 'Income':
      return <Income {...sharedProps} />;
    case 'Identity':
      return <Identity {...sharedProps} />;
    case 'Household':
      return <Household {...sharedProps} />;
    case 'Shared Lease':
      return <SharedLease {...sharedProps} />;
    default:
      return <div>Select a section from the sidebar.</div>;
    }
  };


  return (
    <>
    <div>
      <Navbar/>
      {/* Application Section */}
      <div className="flex flex-col p-8 bg-[#FFF8E9] min-h-screen">
        
        {/* Application Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Application - Melton South, 3338</h1>
          <p className="text-gray-600">
            You are applying for the property listed at Melton South, 3338
          </p>
        </div>

        {/* Content */}
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="flex flex-col w-1/4 bg-gray-100 p-4 rounded-lg shadow">
            {sectionList.map((item, index) => (
              <div
                key={index}
                onClick={() => setActiveSection(item)}
                className={`p-3 mb-2 rounded-md font-semibold cursor-pointer ${
                  item === activeSection ? 'bg-[#9747FF] text-white' : 'bg-transparent text-black hover:bg-violet-900 hover:text-white'
                }`}
              >
                {item}
              </div>
            ))}
          </div>

          {/* Main Form */}
          <div className="flex-1 bg-gray-50 p-6 rounded-lg shadow">
            {/* Step Indicator */}
            <div className="mb-4 text-sm text-gray-600 font-medium">
              Step {currentIndex + 1} of {sectionList.length}: {activeSection}
            </div>

            {/* Form Section */}
            {renderFormSection()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={goBack}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={goNext}
                disabled={currentIndex === sectionList.length - 1}
                className="px-4 py-2 bg-[#9747FF] text-white text-gray-800 font-semibold rounded disabled:opacity-50 hover:bg-violet-900 hover:text-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex mt-12">
          <button
            onClick={() => {
              if (!rentalApplication) {
                alert("No rental application found. Please complete your application before submitting.");
                return;
              }

              // First mark as submitted = true
              Meteor.call(
                "rentalApplications.update",
                rentalApplication._id,
                { submitted: true },
                (err, res) => {
                  if (err) {
                    alert(err.reason || "Error submitting application");
                    return;
                  }
                  if (res === 0) {
                    alert("No rental application found. Please complete your application before submitting.");
                    return;
                  }

                  // ✅ Then set status = Pending
                  Meteor.call(
                    "rentalApplications.setStatus",
                    rentalApplication._id,
                    "Pending",
                    (err2) => {
                      if (err2) {
                        alert(err2.reason || "Error setting status to Pending");
                      } else {
                        alert("Application submitted successfully!");
                      }
                    }
                  );
                }
              );
            }}
            className="px-6 py-3 bg-[#9747FF] text-white font-semibold rounded-lg shadow hover:bg-violet-900 transition"
          >
            Submit
          </button>
        </div>
      </div>
      <Footer/>
      </div>
    </>
  );
}

export default Apply;

