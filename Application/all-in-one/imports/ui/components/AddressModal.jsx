import React, { useState } from 'react';

function AddressModal({ open, onClose }) {
  const [ownership, setOwnership] = useState(null);
  const [reference, setReference] = useState({
    name: '',
    number: '',
    email: '',
    type: '',
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-[#FEF7E7] p-8 rounded-lg shadow-lg w-[90%] max-w-5xl relative">
        {/* Title */}
        <h2 className="text-2xl font-bold mb-1">Add Address</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Please fill out the following to add address.
        </p>

        {/* Divider */}
        <div className="border-t border-gray-300 mb-6"></div>

        {/* Form Grid */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column: Address Details */}
          <div className="w-full md:w-1/2">
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
          </div>

          {/* Right Column: Reference Details */}
          <div className="w-full md:w-1/2">
            <label className="block font-semibold mb-2">Reference Details</label>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                placeholder="Full name"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                value={reference.name}
                onChange={(e) => setReference({ ...reference, name: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. 0400 000 000"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                value={reference.number}
                onChange={(e) => setReference({ ...reference, number: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                placeholder="example@email.com"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                value={reference.email}
                onChange={(e) => setReference({ ...reference, email: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Reference Type</label>
              <input
                type="text"
                placeholder="e.g. Landlord, Agent"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                value={reference.type}
                onChange={(e) => setReference({ ...reference, type: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
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
