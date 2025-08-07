import React from 'react';

/**
 * ClearDialog Component
 * 
 * A modal dialog component used to confirm the clearing of all availabilities
 * from the calendar. This component provides a warning to users before
 * they clear all their scheduled availabilities.
 * 
 * Features:
 * - Modal overlay with backdrop
 * - Warning message about clearing all availabilities
 * - Cancel and confirm buttons
 * - Consistent styling with the application theme
 * - Red confirm button to indicate destructive action
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the dialog is open
 * @param {Function} props.onConfirm - Function to call when user confirms clearing
 * @param {Function} props.onCancel - Function to call when user cancels
 * @returns {JSX.Element|null} The rendered dialog component or null if not open
 */
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
            className="bg-gray-300 hover:bg-gray-200 text-black font-semibold py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-400 text-white font-semibold py-2 px-4 rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
