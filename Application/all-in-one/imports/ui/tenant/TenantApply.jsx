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

function useQuery() {
  return new URLSearchParams(useLocation().search);
}


function Apply() {
  const { id } = useParams();
  const query = useQuery();
  const tenantId = query.get("tenantId");

  console.log("Property ID:", id);
  console.log("Tenant ID:", tenantId);
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
      </div>
      <Footer/>
      </div>
    </>
  );
}

export default Apply;
