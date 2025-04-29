import React, { useState } from 'react';

function IncomeModal({ open, onClose }) {
  const [ownership, setOwnership] = useState(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-[#FEF7E7] p-8 rounded-lg shadow-lg w-[90%] max-w-md relative">
        
        {/* Title */}
        <h2 className="text-2xl font-bold mb-1">Add Income Source</h2>
        <p className="text-gray-600 mb-6 text-sm">Please fill out the following to add income source.</p>

        {/* Divider */}
        <div className="border-t border-gray-300 mb-6"></div>

        {/* Income Type */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Income Type</label>
          <input
            type="text"
            placeholder="E.g. Employment, pension..."
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm"
          />
          <p className="text-gray-500 text-xs mt-1">
            Please provide type of income (eg: family allowance, pension).
          </p>
        </div>

        {/* Annual Amount */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Move in Date</label>
          <input
            type="text"
            placeholder="Amount in AUD"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm"
          />
          <p className="text-gray-500 text-xs mt-1">
          Please provide the annual aggregation of this source.
          </p>
        </div>

        {/* Supporting Documents */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Supporting Documents</label>
          <input
            type="text"
            placeholder="Add Source"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm"
          />
          <p className="text-gray-500 text-xs mt-1">
            Please provide proof of income source (eg: bank statement, income receipt) NEED TO IMPLEMENT DRAG AND DROP
          </p>
        </div>

        {/* Save Address */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-black text-white px-6 py-2 rounded-full text-sm hover:bg-gray-800"
          >
            Save Income Source
          </button>
        </div>

      </div>
    </div>
  );
}

export default IncomeModal;
