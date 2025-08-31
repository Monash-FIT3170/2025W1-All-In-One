import React from 'react';
import { BedDouble, ShowerHead, CarFront } from 'lucide-react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { TenantBookings, Tenants, Employment } from '../../../api/database/collections';

export const EventDetailModal = ({ event, onClose }) => {
  if (!event) return null;

  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleString('default', { month: 'long' });
    const year = d.getFullYear();
    const suffix =
      day === 1 || day === 21 || day === 31 ? 'st' :
      day === 2 || day === 22 ? 'nd' :
      day === 3 || day === 23 ? 'rd' : 'th';
    return `${day}${suffix} ${month} ${year}`;
  };

  const formatTime = (start, end) => {
    const opts = { hour: 'numeric', minute: '2-digit', hour12: true };
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleTimeString([], opts)} - ${e.toLocaleTimeString([], opts)}`;
  };

  // Fetch tenant booking/details for this availability (private open house invite or booked)
  const availabilityId = event.id;
  const { booking, ready: dataReady } = useTracker(() => {
    if (!availabilityId) return { booking: null, ready: true };
    const h1 = Meteor.subscribe('tenantBookings.forAvailability', availabilityId);
    const h2 = Meteor.subscribe('tenants');
    const h3 = Meteor.subscribe('employment');
    const ready = [h1.ready?.(), h2.ready?.(), h3.ready?.()].every((x) => x !== false);
    const b = TenantBookings.findOne({ agentAvailabilityId: availabilityId });
    return { booking: b, ready };
  }, [availabilityId]);

  let tenantName = null;
  let tenantAge = null;
  let occupation = null;
  if (dataReady && booking) {
    tenantName = booking.tenantName || null;
    const tenant = Tenants.findOne({ ten_id: booking.tenantId });
    if (tenant?.ten_dob) {
      const dob = new Date(tenant.ten_dob);
      const diff = Date.now() - dob.getTime();
      tenantAge = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
    }
    const emp = Employment.findOne({ ten_id: booking.tenantId });
    occupation = emp?.emp_job_title || null;
  }

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
            src={event.property?.image || event.image || '/images/default.jpg'}
            alt="Property"
            className="rounded-xl mb-2 w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/default.jpg';
            }}
          />

          <div className="bg-[#FFF8E9] p-4 rounded-xl">
            {event.property ? (
              <>
                <p className="text-center text-gray-700">
                  {event.property.address || 'No address available'}
                </p>

                {event.property.price && (
                  <p className="text-center text-sm text-gray-700">
                    ${event.property.price} per week
                  </p>
                )}

                <div className="flex justify-center gap-6 text-sm text-gray-600 mt-2">
                  <div className="flex items-center gap-1">
                    <BedDouble className="w-4 h-4" />
                    {event.property.bedrooms ?? '—'}
                  </div>
                  <div className="flex items-center gap-1">
                    <ShowerHead className="w-4 h-4" />
                    {event.property.bathrooms ?? '—'}
                  </div>
                  <div className="flex items-center gap-1">
                    <CarFront className="w-4 h-4" />
                    {event.property.parking ?? '—'}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-700">No property information</p>
            )}
          </div>
        </div>

        {/* Right: Booking Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">{formatDate(event.start)}</h2>
          <p className="text-lg font-medium text-gray-700">
            {formatTime(event.start, event.end)}
          </p>

          {tenantName ? (
            <div className="bg-white p-4 rounded-xl space-y-2 mt-4">
              <p className="font-semibold text-lg">{tenantName}</p>
              <p className="text-sm text-gray-600">Age: {tenantAge ?? '—'}</p>
              <p className="text-sm text-gray-600">Occupation: {occupation ?? '—'}</p>
              {booking?.status && (
                <p className="text-xs text-gray-500">Booking status: {booking.status}</p>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-600 mt-4 italic">
              {dataReady ? 'No tenant information.' : 'Loading tenant information...'}
            </div>
          )}

          {event.notes?.trim() && (
            <div className="bg-white p-4 rounded-xl mt-4 text-sm text-gray-700">
              <p className="font-semibold mb-1">Note</p>
              <p className="whitespace-pre-line">{event.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
