import React from 'react';

const FilterMenu = ({
    show, onClose,
    applications = [],
    properties = [],
    tenants = [],
    selectedStatuses = [],
    setSelectedStatuses,
    selectedApplicants = [],
    setSelectedApplicants,
    selectedProperties = [],
    setSelectedProperties
  }) => {
  // Get unique property IDs from applications
  const uniqueProperties = Array.from(new Set(applications.map(app => app.prop_id)));
  // Get unique applicant IDs from applications
  const uniqueApplicants = Array.from(new Set(applications.map(app => app.ten_id)));
  // Define all possible statuses for filtering
  const allStatuses = [
    'To Be Reviewed',
    'Rejected',
    'Shortlisted',
    'Flagged',
    'Approved'
  ];

  // If the filter menu is not open, render nothing
  if (!show) return null;

  return (
    <div
      className={`absolute top-full border right-0 mt-2 w-96 bg-white p-6 shadow-lg rounded-lg z-50`}
    >
      {/* Close button for the filter menu */}
      <button
        className="float-right text-2xl"
        onClick={onClose}
        aria-label="Close filter menu"
      >
        ×
      </button>
      <h3 className="font-bold mb-4">Filter by:</h3>

      {/* Divider */}
      <hr style={{
        color: '#000000',
        backgroundColor: '#000000',
        height: .5,
        borderColor: '#000000'
      }} className="my-4" />

      {/* Property Filter Section */}
      <div className="mb-4">
        <div className="font-semibold mb-2">Property</div>
        {/* Render a checkbox for each unique property with purple accent */}
        {uniqueProperties.map(propId => {
          // Find the property object for display
          const property = properties.find(p => p.prop_id === propId);
          return (
            <label key={propId} className="flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-purple-600"
                checked={selectedProperties.includes(propId)}
                onChange={(e) => {
                  // Add or remove property from selectedProperties
                  if (e.target.checked) {
                    setSelectedProperties([...selectedProperties, propId]);
                  } else {
                    setSelectedProperties(selectedProperties.filter(id => id !== propId));
                  }
                }}
              />
              {/* Show property address or fallback to ID */}
              {property ? property.prop_address : propId}
            </label>
          );
        })}
      </div>
      {/* Applicant Filter Section */}
      <div className="mb-4">
        <div className="font-semibold mb-2">Applicant</div>
        {/* Render a checkbox for each unique applicant with purple accent */}
        {uniqueApplicants.map(tenId => {
          // Find the tenant object for display
          const tenant = tenants.find(t => t.ten_id === tenId);
          return (
            <label key={tenId} className="flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-purple-600"
                checked={selectedApplicants.includes(tenId)}
                onChange={(e) => {
                  // Add or remove applicant from selectedApplicants
                  if (e.target.checked) {
                    setSelectedApplicants([...selectedApplicants, tenId]);
                  } else {
                    setSelectedApplicants(selectedApplicants.filter(id => id !== tenId));
                  }
                }}
              />
              {/* Show applicant name or fallback to ID */}
              {tenant ? `${tenant.ten_fn} ${tenant.ten_ln}` : tenId}
            </label>
          );
        })}
      </div>
      {/* Status Filter Section */}
      <div className="mb-4">
        <div className="font-semibold mb-2">Status</div>
        {/* Render a checkbox for each possible status with purple accent */}
        {allStatuses.map(status => (
          <label key={status} className="flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-purple-600"
              checked={selectedStatuses.includes(status)}
              onChange={(e) => {
                // Add or remove status from selectedStatuses
                if (e.target.checked) {
                  setSelectedStatuses([...selectedStatuses, status]);
                } else {
                  setSelectedStatuses(selectedStatuses.filter(s => s !== status));
                }
              }}
            />
            {status}
          </label>
        ))}
      </div>
    </div>
  );
};

export default FilterMenu;
