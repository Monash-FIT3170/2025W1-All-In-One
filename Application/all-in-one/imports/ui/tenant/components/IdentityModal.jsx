import React, { useState } from 'react';

function IdentityModal({ open, onClose, onSave }) {
  const [type, setType] = useState('');
  const [scan, setScan] = useState('');

  const handleSave = () => {
    if (!type || !scan) return alert("Please fill in all fields.");

    onSave({ type, scan });
    setType('');
    setScan('');
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

        <h2 className="text-2xl font-bold mb-1">Add Identity Document</h2>
        <p className="text-gray-600 mb-6 text-sm">Please provide details for your identity document.</p>
        <div className="border-t border-gray-300 mb-6"></div>

        {/* Identity Type */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Document Type</label>
          <input
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="E.g. Passport, Driver's License"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm"
          />
        </div>

        {/* Document Scan */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Scan Reference</label>
          <input
            type="text"
            value={scan}
            onChange={(e) => setScan(e.target.value)}
            placeholder="e.g. URL to scan or description"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-black text-white px-6 py-2 rounded-full text-sm hover:bg-gray-800"
          >
            Save Identity Document
          </button>
        </div>
      </div>
    </div>
  );
}

export default IdentityModal;
