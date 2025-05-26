import React, { useState, useEffect } from 'react';
// import { mockData } from '../../../api/database/mockData.js';
import { mockData } from '/imports/api/database/mockData.js';


export const InspectionDialog = ({ isOpen, onSubmit, onClose }) => {
  const [property, setProperty] = useState('');
  const [tenant, setTenant] = useState('');
  const [showPropertySuggestions, setShowPropertySuggestions] = useState(false);
  const [showTenantSuggestions, setShowTenantSuggestions] = useState(false);

  // Filter property by prop_address
  const filteredProperties = mockData.properties.filter(p =>
    p.prop_address.toLowerCase().includes(property.toLowerCase())
  );

  // Filter tenants by full name
  const filteredTenants = mockData.tenants.filter(t =>
    `${t.ten_fn} ${t.ten_ln}`.toLowerCase().includes(tenant.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setProperty('');
      setTenant('');
      setShowPropertySuggestions(false);
      setShowTenantSuggestions(false);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const selectedProperty = mockData.properties.find(p => p.prop_address === property.trim());
    const selectedTenant = mockData.tenants.find(t => `${t.ten_fn} ${t.ten_ln}` === tenant.trim());

    onSubmit({
      type: 'Inspection',
      property: selectedProperty?.prop_address || property,
      image: selectedProperty?.image || '/property.png',
      price: selectedProperty?.prop_pricepweek || '-',
      bedrooms: selectedProperty?.prop_numbeds || '-',
      bathrooms: selectedProperty?.prop_numbaths || '-',
      parking: selectedProperty?.prop_numcarspots || '-',
      tenant: selectedTenant ? `${selectedTenant.ten_fn} ${selectedTenant.ten_ln}` : tenant,
      tenantAge: '-', // You can calculate age from ten_dob if needed
      occupation: '-', // Add if you have occupation field
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

        <h2 className="text-2xl font-bold text-center text-gray-800">Inspection</h2>

        {/* Property Field */}
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
                      setProperty(p.prop_address);
                      setShowPropertySuggestions(false);
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

        {/* Tenant Field */}
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
                      setTenant(`${t.ten_fn} ${t.ten_ln}`);
                      setShowTenantSuggestions(false);
                    }}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    {t.ten_fn} {t.ten_ln}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">No matches found</div>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
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
