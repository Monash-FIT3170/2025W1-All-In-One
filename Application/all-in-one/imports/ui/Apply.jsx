import React, { useState } from 'react';
import GeneralSection from './applyPages/GeneralSection';
import PersonalDetails from './applyPages/PersonalDetails';
import AboutMe from './applyPages/AboutMe';
import AddressHistory from './applyPages/AddressHistory';
import Employment from './applyPages/Employment';
import Income from './applyPages/Income';
import Identity from './applyPages/Identity';
import Household from './applyPages/Household';
// import other forms here when created

function Apply() {
  const [activeSection, setActiveSection] = useState('General');

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
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-[#D6F2F2]">
        <div className="flex items-center gap-2">
          <img src="/images/logo.png" alt="Logo" className="h-12" />
          <span className="text-xl font-bold">All In One</span>
        </div>
        <div className="flex items-center gap-4">
          {['Messages', 'Applications', 'Tickets', 'Properties'].map((label) => (
            <button
              key={label}
              className="bg-yellow-300 px-4 py-2 rounded-full font-semibold hover:bg-yellow-400 transition"
            >
              {label}
            </button>
          ))}
          <button className="bg-yellow-300 px-4 py-2 rounded-full font-semibold hover:bg-yellow-400 transition">
            Log out
          </button>
          <img src="/images/user-avatar.png" alt="User Avatar" className="w-10 h-10 rounded-full" />
        </div>
      </div>

      {/* Application Section */}
      <div className="flex flex-col p-8 bg-yellow-100">
        {/* Application Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Application - Melton South, 3338</h1>
          <p className="text-gray-600">You are applying for the property listed at Melton South, 3338</p>
        </div>

        {/* Content */}
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="flex flex-col w-1/4 bg-gray-100 p-4 rounded-lg">
            {[
              'General',
              'Personal Details',
              'About Me',
              'Address History',
              'Employment',
              'Income',
              'Identity',
              'Household',
            ].map((item, index) => (
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
            {/* Render corresponding form */}
            {renderFormSection()}
          </div>
        </div>
      </div>
    </>
  );
}

export default Apply;
