import React from 'react';

function PersonalDetails() {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Personal Details</h3>
      <p className="text-gray-600 text-sm mb-6">Please fill out this section with your details.</p>

      {/* First Name */}
      <div className="mb-4">
        <label htmlFor="first-name" className="block mb-1 font-medium">
          First Name
        </label>
        <input
          type="text"
          id="first-name"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
          placeholder="John"
        />
        <p className="text-gray-600 text-sm mb-6">Your first name must match the first name stated in you primary identity document.</p>
      </div>

        {/* Last Name */}
        <div className="mb-4">
        <label htmlFor="last-name" className="block mb-1 font-medium">
          Last Name
        </label>
        <input
          type="text"
          id="last-name"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
          placeholder="Doe"
        />
        <p className="text-gray-600 text-sm mb-6">Your last name must match the first name stated in you primary identity document.</p>
      </div>

      {/* DOB */}
      <div className="mb-4">
        <label htmlFor="DOB" className="block mb-1 font-medium">
          Date of Birth
        </label>
        <input
          type="text"
          id="DOB"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
          placeholder="DD/MM/YYYY"
        />
        <p className="text-gray-600 text-sm mb-6">*Optional</p>
      </div>

        {/* Phone Number */}
        <div className="mb-4">
        <label htmlFor="phone-number" className="block mb-1 font-medium">
          Phone Number
        </label>
        <input
          type="text"
          id="phone-number"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
          placeholder="DD/MM/YYYY"
        />
        <p className="text-gray-600 text-sm mb-6">Numbers only; without any spaces nor special characters.</p>
      </div>

      <button className="bg-yellow-300 px-6 py-2 rounded-full font-semibold hover:bg-yellow-400 transition">
        Save Details
      </button>
    </div>
  );
}

export default PersonalDetails;
