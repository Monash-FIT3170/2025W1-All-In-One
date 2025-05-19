import React from 'react';

const FilterMenu = ({ show, onClose, className = '', style = {} }) => {
  if (!show) return null;
  return (
    <div
      className={`absolute top-full right-0 mt-2 w-96 bg-white p-6 shadow-lg rounded-lg z-50 ${className}`}
      style={{ minWidth: '300px', ...style }}
    >
      <button
        className="float-right text-2xl"
        onClick={onClose}
        aria-label="Close filter menu"
      >
        ×
      </button>
      <h3 className="font-bold mb-4">Filter by:</h3>
      {/* Property Filter */}
      <div className="mb-4">
        <div className="font-semibold mb-2">Property</div>
        {/* Add property filter options here */}
      </div>
      {/* Applicant Filter */}
      <div className="mb-4">
        <div className="font-semibold mb-2">Applicant</div>
        {/* Add applicant filter options here */}
      </div>
      {/* Status Filter */}
      <div className="mb-4">
        <div className="font-semibold mb-2">Status</div>
        {/* Add status filter options here */}
      </div>
      {/* Decision Filter */}
      <div className="mb-4">
        <div className="font-semibold mb-2">Decision</div>
        {/* Add decision filter options here */}
      </div>
    </div>
  );
};

export default FilterMenu;
