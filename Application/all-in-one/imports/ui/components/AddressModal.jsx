import React, { useState } from 'react';

function AddressModal({ open, onClose }) {
  const [ownership, setOwnership] = useState(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-[#FEF7E7] p-8 rounded-lg shadow-lg w-[90%] max-w-md relative">
        
        {/* Title */}
        <h2 className="text-2xl font-bold mb-1">Add Address</h2>
        <p className="text-gray-600 mb-6 text-sm">Please fill out the following to add address.</p>

        {/* Divider */}
        <div className="border-t border-gray-300 mb-6"></div>

        {/* Address Field */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Address</label>
          <input
            type="text"
            placeholder="Street, Suburb, State, Postcode, Country"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm"
          />
          <p className="text-gray-500 text-xs mt-1">
            Please provide the street number, street name, state, postcode and country.
          </p>
        </div>

        {/* Move in Date */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Move in Date</label>
          <input
            type="text"
            placeholder="mm/yyyy"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm"
          />
          <p className="text-gray-500 text-xs mt-1">
            Please provide move in month and year.
          </p>
        </div>

        {/* Move out Date */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Move out Date</label>
          <input
            type="text"
            placeholder="mm/yyyy"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm"
          />
          <p className="text-gray-500 text-xs mt-1">
            Please provide move out month and year.
          </p>
        </div>

        {/* Ownership */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Ownership</label>
          <p className="text-gray-500 text-xs mb-2">Did you own this property?</p>
          <div className="flex gap-4">
            <button
              onClick={() => setOwnership('yes')}
              className={`px-6 py-2 rounded-full text-sm font-semibold ${
                ownership === 'yes' ? 'bg-yellow-400 text-white' : 'bg-yellow-200'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setOwnership('no')}
              className={`px-6 py-2 rounded-full text-sm font-semibold ${
                ownership === 'no' ? 'bg-yellow-400 text-white' : 'bg-yellow-200'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Save Address */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-black text-white px-6 py-2 rounded-full text-sm hover:bg-gray-800"
          >
            Save Address
          </button>
        </div>

      </div>
    </div>
  );
}

export default AddressModal;
