import React from 'react';
import { BedDouble, ShowerHead, CarFront } from 'lucide-react';


export const EventDetailModal = ({ event, onClose }) => {
  if (!event) return null;

  // Extract property and tenant info if available
  const property = event.property || {};
  const tenant = event.tenant || {};

  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const suffix =
      day === 1 || day === 21 || day === 31
        ? 'st'
        : day === 2 || day === 22
        ? 'nd'
        : day === 3 || day === 23
        ? 'rd'
        : 'th';
    return `${day}${suffix} ${month} ${year}`;
  };

  const formatTime = (start, end) => {
    const opts = { hour: 'numeric', minute: '2-digit', hour12: true };
    return `${start.toLocaleTimeString([], opts)} - ${end.toLocaleTimeString([], opts)}`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{event.title}</h2>
        <div className="mb-2">
          <strong>Start:</strong> {event.start ? new Date(event.start).toLocaleString() : ''}
        </div>
        <div className="mb-2">
          <strong>End:</strong> {event.end ? new Date(event.end).toLocaleString() : ''}
        </div>
        {property.address && (
          <div className="mb-2">
            <strong>Property Address:</strong> {property.address}
          </div>
        )}
        {tenant.name && (
          <div className="mb-2">
            <strong>Tenant Name:</strong> {tenant.name}
          </div>
        )}
        {tenant.id && (
          <div className="mb-2">
            <strong>Tenant ID:</strong> {tenant.id}
          </div>
        )}
        {/* Add more details as needed */}
        <div className="flex justify-end mt-4">
          <button
            className="bg-purple-500 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
