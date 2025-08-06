import React, { useState } from 'react';

export const ResolveTicketDialog = ({ isOpen, onClose, ticket }) => {
  if (!isOpen) return null;

  const handleResolve = () => {
    // Logic to resolve the ticket
    console.log(`Ticket ${ticket.ticket_no} resolved`);
    onClose(); // Close the dialog after resolving
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-xl font-bold mb-4">Resolve Ticket</h2>
        <p>Are you sure you want to resolve this ticket?</p>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleResolve}
            className="px-4 py-2 bg-[#9747FF] text-white rounded hover:bg-violet-900"
          >
            Resolve
          </button>
        </div>
      </div>
    </div>
  );
}