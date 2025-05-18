import React from 'react';

export const ActivityTypeDialog = ({ isOpen, onSelect, onClose }) => {
  if (!isOpen) return null;

  return ( 
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-[#FFE284] p-6 rounded-xl shadow-lg w-[380px] text-left space-y-4 relative">
        {/* X Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl font-bold text-black hover:text-gray-700"
        >
          ×
        </button>

        <h2 className="text-xl font-bold text-center mb-4 text-gray-800">Availability Type</h2>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => onSelect('Availability')}
            className="bg-[#FFFFFF] hover:bg-[#CEF4F1] text-black font-semibold py-2 px-4 rounded"
          >
            Availability
          </button>
          <button
            onClick={() => onSelect('Maintenance')}
            className="bg-[#FFFFFF] text-black font-semibold py-2 px-4 rounded opacity-50 cursor-not-allowed"
            disabled
            >
            Ticket (To be added in Milestone 3)
            </button>
        </div>
      </div>
    </div>
  );
};
