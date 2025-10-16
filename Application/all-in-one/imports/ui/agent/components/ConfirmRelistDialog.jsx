import React from 'react';

export const ConfirmRelistDialog = ({ isOpen, onRelist, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Relist or Delete Property Listing</h2>
        <p className="text-gray-600 mb-6">Would you like to Relist or Delete this property listing?</p>
        <div className="flex justify-around">
          <button
            onClick={onRelist}
            className="bg-[#9747FF] hover:bg-purpler-200 text-white font-semibold py-2 px-4 rounded"
          >
            Relist
          </button>
          <button
            onClick={onDelete}
            className="bg-red-500 hover:bg-red-400 text-white font-semibold py-2 px-4 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

