import React from 'react';

export const TypeDialog = ({ isOpen, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-[#FFE284] p-6 rounded-lg shadow-lg w-80 text-center">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Availability Type</h2>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => onSelect('Inspection')}
            className="bg-[#FFFFFF] hover:bg-[#CEF4F1] text-black font-semibold py-2 px-4 rounded"
          >
            Inspection
          </button>
          <button
            onClick={() => onSelect('Open House')}
            className="bg-[#FFFFFF] hover:bg-[#CEF4F1] text-black font-semibold py-2 px-4 rounded"
          >
            Open House
          </button>
        </div>
      </div>
    </div>
  );
};
