import React, {act, useState} from 'react';
import Navbar from './components/TenNavbar';
import Footer from './components/Footer';
import ProfileSection from './settingsPages/profile';

const sectionList= ['Profile']

export default function Settings ({ tenantId }){
    const [activeSection, setActiveSection]= useState(sectionList[0]);
    const currentIndex= sectionList.indexOf(activeSection);

    const goNext= () => {
        if (currentIndex < sectionList.length - 1) {
            setActiveSection(sectionList[currentIndex + 1]);
        }
    };

    const goBack= () => {
        if (currentIndex > 0) {
            setActiveSection(sectionList[currentIndex - 1]);
        }
    };

    const renderSection= () => {
        const sharedProps= { tenId: tenantId };

        switch (activeSection) {
            case 'Profile':
                return <ProfileSection />;
            // Add more cases for other sections as needed
            default:
                return <div>Select a section</div>;
        }
    };

    return (
        <>
        <Navbar/>
        <div className="flex flex-col p-8 bg-[#FFF8E9] min-h-screen">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-4">Settings</h1>
                <p className="text-gray-600">Manage your profile and settings.</p>
            </div>

            <div className="flex gap-8">
                {/*Sidebar*/}
                <div className="flex flex-col w-1/4 bg-gray-100 p-4 rounded-lg shadow">
            {sectionList.map((item, idx) => (
                <div
                key={idx}
                onClick={() => setActiveSection(item)}
                className={`p-3 mb-2 rounded-md font-semibold cursor-pointer ${
                    item == activeSection ? 'bg-[#9747FF] text-white' : 'bg-transparent text-black hover:bg-violet-900 hover:text-white'
                }`}
                >
                    {item}
                </div>
            ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-gray-50 p-6 rounded-lg shadow">
            {/* Step Indicator */}
            <div className="mb-4 text-sm text-gray-600 font-medium">
              Step {currentIndex + 1} of {sectionList.length}: {activeSection}
            </div>

            {/* Form Section */}
            {renderSection()}

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
    </>
  );
}

