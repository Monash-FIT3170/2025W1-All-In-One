import React from 'react';

export const EventDetailModal = ({ event, onClose }) => {
  if (!event) return null;

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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-[#FFE284] p-6 rounded-xl w-[800px] shadow-lg flex gap-6">
        {/* Left: Property Info */}
        <div className="flex-1">
          <img
            src={event.image || '/property.png'}
            alt="Property"
            className="rounded-xl mb-2"
          />
          <div className="bg-[#D9F7F6] p-4 rounded-xl">
            <p className="text-xl font-semibold mb-2">
              ${event.price || 700} per week
            </p>
            <p className="text-gray-700">{event.property || 'Unknown Address'}</p>
            <div className="flex gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <img src="/bath-icon.png" alt="bath" className="w-4 h-4" /> {event.bathrooms || 1}
            </span>
            <span className="flex items-center gap-1">
              <img src="/bed-icon.png" alt="bed" className="w-4 h-4" /> {event.bedrooms || 1}
            </span>
            <span className="flex items-center gap-1">
              <img src="/car-icon.png" alt="car" className="w-4 h-4" /> {event.garages || 1}
            </span>
            </div>
          </div>
        </div>

        {/* Right: Booking Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">
            {formatDate(event.start)}
          </h2>
          <p className="text-lg font-medium text-gray-700">
            {formatTime(event.start, event.end)}
          </p>

          {event.tenant ? (
            <div className="bg-white p-4 rounded-xl space-y-2 mt-4">
              <p className="font-semibold text-lg">{event.tenant}</p>
              <p className="text-gray-500">Age: {event.tenantAge || '-'}</p>
              <p className="text-gray-500">Occupation: {event.occupation || '-'}</p>
            </div>
          ) : (
            <div className="text-sm text-gray-600 mt-4 italic">
              This is an open house slot with no tenant info.
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-6 bg-[#D9F7F6] px-6 py-2 rounded-xl text-black font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
