import React, { useState, useEffect } from 'react';

export const InspectionDialog = ({ isOpen, onSubmit, onClose }) => {
  const [property, setProperty] = useState('');
  const [tenant, setTenant] = useState('');
  const [notes, setNotes] = useState('');
  const [showPropertySuggestions, setShowPropertySuggestions] = useState(false);
  const [showTenantSuggestions, setShowTenantSuggestions] = useState(false);

  const mockProperties = [
    {
      name: '123 Main St',
      price: 750,
      bathrooms: 2,
      bedrooms: 3,
      garages: 1,
      image: '/property.png',
    },
    {
      name: '456 Potato Road',
      price: 800,
      bathrooms: 1,
      bedrooms: 2,
      garages: 1,
      image: '/property2.png',
    },
  ];

  const mockTenants = [
    { name: 'Bob Ross', age: 28, occupation: 'Software Engineer' },
    { name: 'Ada Lovelace', age: 35, occupation: 'Interior Designer' },
    { name: 'Jackie Chan', age: 18, occupation: 'Student' },
  ];

  const filteredProperties = mockProperties.filter(p =>
    p.name.toLowerCase().includes(property.toLowerCase())
  );

  const filteredTenants = mockTenants.filter(t =>
    t.name.toLowerCase().includes(tenant.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setProperty('');
      setTenant('');
      setNotes('');
      setShowPropertySuggestions(false);
      setShowTenantSuggestions(false);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const selectedProperty = mockProperties.find(p => p.name === property.trim());
    const selectedTenant = mockTenants.find(t => t.name === tenant.trim());

    onSubmit({
      type: 'Inspection',
      property: selectedProperty?.name || property,
      price: selectedProperty?.price,
      bathrooms: selectedProperty?.bathrooms,
      bedrooms: selectedProperty?.bedrooms,
      garages: selectedProperty?.garages,
      image: selectedProperty?.image,
      tenant: selectedTenant?.name || tenant,
      tenantAge: selectedTenant?.age,
      occupation: selectedTenant?.occupation,
      notes,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-[#FFE284] p-6 rounded-xl shadow-lg w-[380px] text-left space-y-4 relative">
        {/* X Close Button */}
        <button
          className="absolute top-4 right-4 text-xl font-bold text-black hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-center text-gray-800">Inspection</h2>

        {/* Property */}
        <div>
          <label className="block text-black font-semibold mb-1">Property</label>
          <input
            type="text"
            placeholder="Search Property..."
            value={property}
            onChange={(e) => {
              setProperty(e.target.value);
              setShowPropertySuggestions(true);
            }}
            className="w-full px-4 py-2 rounded-lg bg-[#FFF8E9] border border-gray-300"
          />
          {showPropertySuggestions && property && (
            <div className="mt-1 border rounded bg-white max-h-40 overflow-y-auto shadow">
              {filteredProperties.length > 0 ? (
                filteredProperties.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setProperty(p.name);
                      setShowPropertySuggestions(false);
                    }}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    {p.name}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">No matches found</div>
              )}
            </div>
          )}
        </div>

        {/* Tenant */}
        <div>
          <label className="block text-black font-semibold mb-1">Tenant</label>
          <input
            type="text"
            placeholder="Search Tenant Name..."
            value={tenant}
            onChange={(e) => {
              setTenant(e.target.value);
              setShowTenantSuggestions(true);
            }}
            className="w-full px-4 py-2 rounded-lg bg-[#FFF8E9] border border-gray-300"
          />
          {showTenantSuggestions && tenant && (
            <div className="mt-1 border rounded bg-white max-h-40 overflow-y-auto shadow">
              {filteredTenants.length > 0 ? (
                filteredTenants.map((t, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setTenant(t.name);
                      setShowTenantSuggestions(false);
                    }}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    {t.name}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">No matches found</div>
              )}
            </div>
          )}
        </div>

        {/* Notes */}
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
