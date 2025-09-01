import React from 'react';

export const FilterTicketsDialog = ({ isOpen, filterStatuses, setFilterStatuses, onApply }) => {
    if (!isOpen) return null;

    const handleCheckboxChange = (status) => {
        if (filterStatuses.includes(status)) {
            setFilterStatuses(filterStatuses.filter(s => s !== status));   
        }
        else {
            setFilterStatuses([...filterStatuses, status]);
        }
    }

    return (
        <div className="absolute mt-2 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
            <div className="bg-white rounded-lg p-6 w-80">
            <h3 className="text-xl font-semibold mb-4">Filter Tickets</h3>
            <div className="mb-4">
                <label className="flex items-center mb-2">
                <input 
                    type="checkbox" 
                    checked={filterStatuses.includes("Active")} 
                    onChange={() => handleCheckboxChange("Active")}
                    className="mr-2"
                />
                Active
                </label>
                <label className="flex items-center">
                <input 
                    type="checkbox" 
                    checked={filterStatuses.includes("Resolved")} 
                    onChange={() => handleCheckboxChange("Resolved")}
                    className="mr-2"
                />
                Resolved
                </label>
            </div>
            <button 
                onClick={() => onApply()} 
                className="bg-[#9747FF] hover:bg-[#7d3dd1] text-white px-4 py-2 rounded-md w-full"
            >
                Apply
            </button>
            </div>
        </div>
    );
};