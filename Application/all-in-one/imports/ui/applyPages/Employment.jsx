// src/pages/forms/GeneralForm.jsx
import React from 'react';

function Employment() {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Current Employment</h3>
      <p className="text-gray-600 text-sm mb-6">Your current employment will be taken into account for the application</p>

      {/* No Employment */}
      <div className="mb-4">
      <div className="flex items-center space-x-2">
        <input
            type="checkbox"
            id="not-employed"
            className="w-4 h-4 text-yellow-400 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500"
        />
        <label htmlFor="not-employed" className="text-sm font-medium text-gray-700">
            I am currently not Employed
        </label>
        </div>
        <p className="text-gray-600 text-sm mb-6">You do not need to provide employment information if you are currently not employed</p>
      </div>

        {/* Employment Type */}
        <div className="mb-4">
        <label htmlFor="employment-type" className="block mb-1 font-medium">
            Employment Type
        </label>
        <select
          id="lease-term"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
        >
          <option value="" disabled selected>
            Select your current employment
          </option>
          <option value="1">Part Time</option>
          <option value="2">Casual</option>
          <option value="3">Full Time</option>
        </select>
        <p className="text-gray-600 text-sm mb-6">Please provide your employment type (g: self-employed, part-time, casual, full-time)</p>
      </div>

        {/* Company Name */}
        <div className="mb-4">
        <label htmlFor="company-name" className="block mb-1 font-medium">
            Company Name
        </label>
        <input
          type="text"
          id="company-name"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
          placeholder="E.g. Google"
        />
        <p className="text-gray-600 text-sm mb-6">What is the name of the company you were employed at?</p>
      </div>

      {/* Job Title */}
      <div className="mb-4">
        <label htmlFor="job-title" className="block mb-1 font-medium">
            Job Title
        </label>
        <input
          type="text"
          id="job-title"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
          placeholder="E.g. Manager"
        />
        <p className="text-gray-600 text-sm mb-6">What is your job title?</p>
      </div>

        {/* Start Date */}
        <div className="mb-4">
        <label htmlFor="start-date" className="block mb-1 font-medium">
            Start Date
        </label>
        <input
          type="text"
          id="start-date"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
          placeholder="DD/MM/YYYY"
        />
        <p className="text-gray-600 text-sm mb-6">When did you start working here?</p>
      </div>

      <button className="bg-yellow-300 px-6 py-2 rounded-full font-semibold hover:bg-yellow-400 transition">
        Save Details
      </button>
    </div>
  );
}

export default Employment;
