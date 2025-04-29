// src/pages/forms/GeneralForm.jsx
import React from 'react';

function GeneralSection() {
  return (
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
          placeholder="e.g., 400"
        />
      </div>

      <button className="bg-yellow-300 px-6 py-2 rounded-full font-semibold hover:bg-yellow-400 transition">
        Save Details
      </button>
    </div>
  );
}

export default GeneralSection;
