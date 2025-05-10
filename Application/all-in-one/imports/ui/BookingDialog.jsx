import React, { useState } from 'react';

export const BookingDialog = ({ isOpen, onSelect }) => {
  const [property, setProperty] = useState('');
  const [tenant, setTenant] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSelect = (type) => {
    onSelect({
      type,
      property,
      tenant,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-[#FFE284] p-6 rounded-xl shadow-lg w-[380px] text-left space-y-4">
        <h2 className="text-2xl font-bold text-center text-gray-800">Availability</h2>

        <div>
          <label className="block text-black font-semibold mb-1">Property</label>
          <input
            type="text"
            placeholder="Search Property..."
            value={property}
            onChange={(e) => setProperty(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-[#FFF8E9] border border-gray-300"
          />
        </div>

        <div>
          <label className="block text-black font-semibold mb-1">Tenant</label>
          <input
            type="text"
            placeholder="Search Tenant Name..."
            value={tenant}
            onChange={(e) => setTenant(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-[#FFF8E9] border border-gray-300"
          />
        </div>

        <div>
          <label className="block text-black font-semibold mb-1">Notes</label>
          <textarea
            placeholder="Notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-[#FFF8E9] border border-gray-300"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-black font-semibold mb-2">Task Type</label>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleSelect('Inspection Availability')}
              className="bg-[#D9F7F6] hover:bg-[#b8ebe9] text-black font-bold py-2 px-4 rounded-full"
            >
              Inspection
            </button>
            <button
              onClick={() => handleSelect('Open House Availability')}
              className="bg-white hover:bg-gray-100 text-black font-bold py-2 px-4 rounded-full border"
            >
              Open House
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
