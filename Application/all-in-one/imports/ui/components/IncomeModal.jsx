import React, { useState } from 'react';

function IncomeModal({ open, onClose, onSave }) {
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [documents, setDocuments] = useState('');

  const handleSave = () => {
    if (!type || !amount) return alert("Please fill in the required fields.");

    onSave({
      type,
      amount,
      documents
    });

    // Reset fields and close
    setType('');
    setAmount('');
    setDocuments('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-[#FEF7E7] p-8 rounded-lg shadow-lg w-[90%] max-w-md relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black text-xl font-bold focus:outline-none"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-1">Add Income Source</h2>
        <p className="text-gray-600 mb-6 text-sm">Please fill out the following to add income source.</p>

        <div className="border-t border-gray-300 mb-6"></div>

        {/* Income Type */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Income Type</label>
          <input
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="E.g. Employment, pension..."
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm"
          />
        </div>

        {/* Annual Amount */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Annual Amount (AUD)</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in AUD"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm"
          />
        </div>

        {/* Supporting Documents */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Supporting Documents</label>
          <input
            type="text"
            value={documents}
            onChange={(e) => setDocuments(e.target.value)}
            placeholder="Add Source"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
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
