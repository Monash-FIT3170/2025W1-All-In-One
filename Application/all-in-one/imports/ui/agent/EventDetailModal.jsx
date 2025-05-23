import React from 'react';
import { BedDouble, ShowerHead, CarFront } from 'lucide-react';

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
      <div className="relative bg-[#CBADD8] p-6 rounded-xl w-[800px] shadow-lg flex gap-6">
        <button
          className="absolute top-4 right-4 text-2xl font-bold text-black hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {/* Left: Property Info */}
        <div className="flex-1">
          <h2 className="text-3xl text-center font-semibold text-gray-800 mb-2 tracking-wide">
            {event.type || ''}
          </h2>

          <img
            src={event.image || '/property.png'}
            alt="Property"
            className="rounded-xl mb-2 w-full h-48 object-cover"
          />
          <div className="bg-[#FFF8E9] p-4 rounded-xl">
            <p className="text-center text-gray-700">{event.property || 'No property information'}</p>
            <p className="text-center text-sm text-gray-700">${event.price || '—'} per week</p>
            
            <div className="flex justify-center gap-6 text-sm text-gray-600 mt-2">
              <div className="flex items-center gap-1">
                <BedDouble className="w-4 h-4 text-gray-600" />
                {event.bedrooms || '—'}
              </div>
              <div className="flex items-center gap-1">
                <ShowerHead className="w-4 h-4 text-gray-600" />
                {event.bathrooms || '—'}
              </div>
              <div className="flex items-center gap-1">
                <CarFront className="w-4 h-4 text-gray-600" />
                {event.parking || '—'}
              </div>
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
            <>
              <div className="bg-white p-4 rounded-xl space-y-2 mt-4">
                <p className="font-semibold text-lg">{event.tenant}</p>
                <p className="text-sm text-gray-600">Age: {event.tenantAge || '—'}</p>
                <p className="text-sm text-gray-600">Occupation: {event.occupation || '—'}</p>
              </div>
            </>

          ) : (
            <div className="text-sm text-gray-600 mt-4 italic">
              No tenant information.
            </div>
          )}
          {/* {event.notes?.trim() && (
            <div className="bg-white p-4 rounded-xl mt-4 text-sm text-gray-700">
              <p className="font-semibold mb-1">Note</p>
              <p className="whitespace-pre-line">{event.notes}</p>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};
