import React from 'react';

export const BookingConfirmDialog = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Booking</h2>
        <p className="text-gray-600 mb-6">Are you sure you want to book this inspection slot?</p>
        <div className="flex justify-around">
          <button
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-200 text-black font-semibold py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-[#9747FF] hover:bg-purple-200 text-white font-semibold py-2 px-4 rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
