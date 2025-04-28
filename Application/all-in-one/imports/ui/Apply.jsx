// src/pages/Apply.js
import React from 'react';
import Navbar from './components/Navbar'; // Navbar is imported correctly

function Apply() {
  return (
    <>
      {/* <Navbar /> */}
      
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
      <div className="flex flex-col p-8">
        {/* Application Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Application - Melton South, 3338</h1>
          <p className="text-gray-600">You are applying for the property listed at Melton South, 3338</p>
        </div>

        {/* Content: Sidebar + Main Form */}
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
                className={`p-3 mb-2 rounded-md font-semibold cursor-pointer ${
                  item === 'General' ? 'bg-yellow-300' : 'hover:bg-yellow-100'
                }`}
              >
                {item}
              </div>
            ))}
          </div>

          {/* Main Form */}
          <div className="flex-1 bg-gray-50 p-6 rounded-lg shadow">
            {/* Inspection Checkbox */}
            <div className="mb-6">
              <label className="flex items-center space-x-2">
                <input type="checkbox" id="inspected" name="inspected" className="w-4 h-4" />
                <span className="text-sm">I have inspected this property.</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Applications will not be processed without an inspection.
              </p>
            </div>

            {/* Form Section */}
            <div>
              <h3 className="text-xl font-semibold mb-2">General</h3>
              <p className="text-gray-600 text-sm mb-6">Please fill out the following details.</p>

              {/* Lease Start Date */}
              <div className="mb-4">
                <label htmlFor="lease-start" className="block mb-1 font-medium">
                  Lease Start Date
                </label>
                <input
                  type="text"
                  id="lease-start"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  placeholder="Pick a date"
                />
              </div>

              {/* Lease Term */}
              <div className="mb-4">
                <label htmlFor="lease-term" className="block mb-1 font-medium">
                  Initial Lease Term
                </label>
                <select
                  id="lease-term"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
                >
                  <option value="" disabled selected>
                    Select desired lease term.
                  </option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                </select>
              </div>

              {/* Rent per Week */}
              <div className="mb-6">
                <label htmlFor="rent" className="block mb-1 font-medium">
                  Rent per week
                </label>
                <input
                  type="text"
                  id="rent"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  value="700"
                />
              </div>

              {/* Save Button */}
              <button className="bg-yellow-300 px-6 py-2 rounded-full font-semibold hover:bg-yellow-400 transition">
                Save Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Apply;
