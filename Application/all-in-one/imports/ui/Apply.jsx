import React, { useState } from 'react';
import GeneralSection from './applyPages/GeneralSection';
import PersonalDetails from './applyPages/PersonalDetails';
import AboutMe from './applyPages/AboutMe';
import AddressHistory from './applyPages/AddressHistory';
import Employment from './applyPages/Employment';
import Income from './applyPages/Income';
import Identity from './applyPages/Identity';
import Household from './applyPages/Household';
import Navbar from './components/Navbar'; // Assuming you’ll use this later

function Apply() {
  const sectionList = [
    'General',
    'Personal Details',
    'About Me',
    'Address History',
    'Employment',
    'Income',
    'Identity',
    'Household',
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
    switch (activeSection) {
      case 'General':
        return <GeneralSection />;
      case 'Personal Details':
        return <PersonalDetails />;
      case 'About Me':
        return <AboutMe />;
      case 'Address History':
        return <AddressHistory />;
      case 'Employment':
        return <Employment />;
      case 'Income':
        return <Income />;
      case 'Identity':
        return <Identity />;
      case 'Household':
        return <Household />;
      default:
        return <div>Select a section from the sidebar.</div>;
    }
  };

  return (
    <>
      {/* Application Section */}
      <div className="flex flex-col p-8 bg-yellow-100 min-h-screen">
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
                  item === activeSection ? 'bg-yellow-300' : 'hover:bg-yellow-100'
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
                className="px-4 py-2 bg-yellow-400 text-gray-800 font-semibold rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Apply;
