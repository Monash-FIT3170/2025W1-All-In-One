import React from 'react';

export const ClearDialog = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Clear All Availabilities</h2>
        <p className="text-gray-600 mb-6">Are you sure you want to clear all availabilities?</p>
        <div className="flex justify-around">
          <button
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-400 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
