import React, { useState, useEffect } from 'react';

export const OpenHouseDialog = ({ isOpen, onSubmit }) => {
  const [property, setProperty] = useState('');
  const [notes, setNotes] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);


  const mockProperties = [
    '123 Main Street',
    '456 Elm Avenue',
    '789 Oak Drive',
    'Sunset Villa',
    'Maple Apartments'
  ];

  const filteredProperties = mockProperties.filter(p =>
    p.toLowerCase().includes(property.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setProperty('');
      setNotes('');
    }
  }, [isOpen]);
  
  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({
      type: 'Open House',
      property,
      tenant: '', // placeholder for compatibility
      notes,
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-[#FFE284] p-6 rounded-xl shadow-lg w-[380px] text-left space-y-4">
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
                      setProperty(p);
                      setShowSuggestions(false);
                    }}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    {p}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">No matches found</div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-black font-semibold mb-1">Notes</label>
          <textarea
            placeholder="Notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-[#FFF8E9] border border-gray-300"
            rows={3}
          ></textarea>
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
