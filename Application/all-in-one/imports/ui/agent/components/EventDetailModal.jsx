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
        {/* Wrap the following in a fragment */}
        <>
          {/* Right: Booking Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">
              {formatDate(new Date(event.start))}
            </h2>
            <p className="text-lg font-medium text-gray-700">
              {formatTime(new Date(event.start), new Date(event.end))}
            </p>

            {tenant.name ? (
              <div className="bg-white p-4 rounded-xl space-y-2 mt-4">
                <p className="font-semibold text-lg">{tenant.name}</p>
                <p className="text-sm text-gray-600">Age: {tenant.age || '—'}</p>
                <p className="text-sm text-gray-600">Occupation: {tenant.occupation || '—'}</p>
              </div>
            ) : (
              <div className="text-sm text-gray-600 mt-4 italic">
                No tenant information.
              </div>
            )}
            {/* Notes */}
            {event.note?.trim() && (
              <div className="bg-white p-4 rounded-xl mt-4 text-sm text-gray-700">
                <p className="font-semibold mb-1">Notes</p>
                <p className="whitespace-pre-line">{event.note}</p>
              </div>
            )}
          </div>
        </>
      </div>
    </div>
  );
};
