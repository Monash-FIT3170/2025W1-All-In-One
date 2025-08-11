import React from 'react';

export const ActivityTypeDialog = ({ isOpen, onSelect, onClose }) => {
  if (!isOpen) return null;

  return ( 
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-[#CBADD8] p-6 rounded-[2rem] shadow-lg w-[440px] text-center space-y-6 relative">
        {/* X Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl font-bold text-black hover:text-gray-700"
        >
          ×
        </button>

        <h2 className="text-4xl font-bold text-black">Activity Type</h2>

        <div className="flex justify-center gap-6">
          <button
            onClick={() => onSelect('Availability')}
            className="bg-[#9747FF] text-white font-semibold py-2 px-6 rounded-full hover:bg-purple-600"
          >
            Availability
          </button>
          <button
            onClick={() => onSelect('Ticket')}
            className="bg-[#9747FF] text-white font-semibold py-2 px-6 rounded-full opacity-50 cursor-not-allowed"
          >
            Ticket
          </button>
        </div>
      </div>
    </div>
  );
};
