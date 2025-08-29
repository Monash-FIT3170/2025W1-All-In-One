import React, { useState, useEffect } from 'react';
// import { mockData } from '../../../api/database/mockData.js';
import { mockData } from '/imports/api/database/mockData.js';


export const OpenHouseDialog = ({ isOpen, onSubmit, onClose }) => {
  const [property, setProperty] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredProperties = mockData.properties.filter(p =>
    p.prop_address.toLowerCase().includes(property.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setProperty('');
      setShowSuggestions(false);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const selected = mockData.properties.find(p => p.prop_address === property.trim());

    onSubmit({
      type: 'Open House',
      property: selected?.prop_address || property,
      image: selected?.image || '/property.png', // Make sure you add .image to your mockData if needed
      price: selected?.prop_pricepweek || '-',
      bedrooms: selected?.prop_numbeds || '-',
      bathrooms: selected?.prop_numbaths || '-',
      parking: selected?.prop_numcarspots || '-',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-[#FFE284] p-6 rounded-xl shadow-lg w-[380px] text-left space-y-4 relative">
        <button
          className="absolute top-4 right-4 text-xl font-bold text-black hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-center text-gray-800">Open House</h2>

        <div>
          <label className="block text-black font-semibold mb-1">Property</label>
          <input
            type="text"
            placeholder="Search Property..."
            value={property}
            onChange={(e) => {
              setProperty(e.target.value);
              setShowSuggestions(true);
            }}
            className="w-full px-4 py-2 rounded-lg bg-[#FFF8E9] border border-gray-300"
          />
          {showSuggestions && property && (
            <div className="mt-1 border rounded bg-white max-h-40 overflow-y-auto shadow">
              {filteredProperties.length > 0 ? (
                filteredProperties.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setProperty(p.prop_address);
                      setShowSuggestions(false);
                    }}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    {p.prop_address}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">No matches found</div>
              )}
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={handleSubmit}
            className="bg-[#CEF4F1] hover:bg-[#b8ebe9] text-black font-bold py-2 px-4 rounded-full"
          >
            Create Availability
          </button>
        </div>
      </div>
    </div>
  );
};
