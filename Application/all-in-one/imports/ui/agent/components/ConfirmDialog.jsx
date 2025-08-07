import React from 'react';

/**
 * ConfirmDialog Component
 * 
 * A modal dialog component used to confirm user actions, specifically
 * for confirming the creation of inspection availabilities in the calendar.
 * 
 * Features:
 * - Modal overlay with backdrop
 * - Confirmation message
 * - Cancel and confirm buttons
 * - Consistent styling with the application theme
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the dialog is open
 * @param {Function} props.onConfirm - Function to call when user confirms
 * @param {Function} props.onCancel - Function to call when user cancels
 * @returns {JSX.Element|null} The rendered dialog component or null if not open
 */
export const ConfirmDialog = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Availability</h2>
        <p className="text-gray-600 mb-6">Are you sure you want to create this inspection availability?</p>
        <div className="flex justify-around">
          <button
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-200 text-black font-semibold py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-[#9747FF] hover:bg-purpler-200 text-white font-semibold py-2 px-4 rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
