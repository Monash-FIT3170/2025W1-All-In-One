import React, { useMemo, useState } from 'react';
import { BedDouble, ShowerHead, CarFront, Pencil, Trash2 } from 'lucide-react';
import { Meteor } from 'meteor/meteor';

export const EventDetailModal = ({ event, onClose }) => {
  if (!event) return null;

  // normalize dates 
  const startDate = useMemo(() => new Date(event.start), [event.start]);
  const endDate   = useMemo(() => new Date(event.end),   [event.end]);

  const [isEditing, setIsEditing] = useState(false);
  const [draftStart, setDraftStart] = useState(toLocalInputValue(startDate));
  const [draftEnd, setDraftEnd]     = useState(toLocalInputValue(endDate));
  const [draftNotes, setDraftNotes] = useState((event.notes ?? event.note ?? '').toString());

  const isBooked = event.status === 'booked';

  function toLocalInputValue(d) {
    if (!d) return '';
    const copy = new Date(d);
    copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
    return copy.toISOString().slice(0, 16); // 'YYYY-MM-DDTHH:mm'
  }

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

  async function handleSave() {
    try {
      const payload = {
        start: new Date(draftStart).toISOString(),
        end:   new Date(draftEnd).toISOString(),
        notes: draftNotes.trim(),
      };

      await new Promise((resolve, reject) => {
        Meteor.call('agentAvailabilities.update', String(event.id), payload, (err, res) => {
          if (err) reject(err); else resolve(res);
        });
      });

      setIsEditing(false);
      onClose?.(); 
    } catch (e) {
      alert('Update failed: ' + (e?.reason || e?.message || e));
    }
  }

  async function handleDelete() {
    try {
      await new Promise((resolve, reject) => {
        Meteor.call('agentAvailabilities.remove', String(event.id), (err, res) => {
          if (err) reject(err); else resolve(res);
        });
      });
      onClose?.();
    } catch (e) {
      alert('Delete failed: ' + (e?.reason || e?.message || e));
    }
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
          {/* Date */}
          <h2 className="text-2xl font-bold mb-2">{formatDate(startDate)}</h2>

          {/* Time */}
          {!isEditing ? (
            <p className="text-lg font-medium text-gray-700">
              {formatTime(startDate, endDate)}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <label className="text-sm font-semibold text-gray-800">Start</label>
              <input
                type="datetime-local"
                className="w-full border rounded p-2 bg-white"
                value={draftStart}
                onChange={(e) => setDraftStart(e.target.value)}
              />
              <label className="text-sm font-semibold text-gray-800">End</label>
              <input
                type="datetime-local"
                className="w-full border rounded p-2 bg-white"
                value={draftEnd}
                onChange={(e) => setDraftEnd(e.target.value)}
              />
            </div>
          )}

          {/* Tenant summary */}
          {event.tenant ? (
            <div className="bg-white p-4 rounded-xl space-y-2 mt-4">
              <p className="font-semibold text-lg">{event.tenant}</p>
              <p className="text-sm text-gray-600">Age: {event.tenantAge || '—'}</p>
              <p className="text-sm text-gray-600">Occupation: {event.occupation || '—'}</p>
            </div>
          ) : (
            <div className="text-sm text-gray-600 mt-4 italic">No tenant information.</div>
          )}

          {/* Notes */}
          {(!isEditing && (event.notes?.trim() || event.note?.trim())) && (
            <div className="bg-white p-4 rounded-xl mt-4 text-sm text-gray-700">
              <p className="font-semibold mb-1">Note</p>
              <p className="whitespace-pre-line">{event.notes ?? event.note}</p>
            </div>
          )}

          {isEditing && (
            <div className="bg-white p-4 rounded-xl mt-4 text-sm text-gray-700">
              <label className="font-semibold mb-1 block">Note</label>
              <textarea
                className="w-full border rounded p-2 bg-white min-h-[90px]"
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                placeholder="Add a note for this availability..."
              />
            </div>
          )}

          {/* Buttons row */}
          <div className="mt-6 flex justify-end gap-2">
            {/* Cancel / Save when editing */}
            {isEditing ? (
              <>
                <button
                  className="px-4 py-2 rounded bg-gray-300 text-black"
                  onClick={() => {
                    // reset draft values to current event values
                    setDraftStart(toLocalInputValue(startDate));
                    setDraftEnd(toLocalInputValue(endDate));
                    setDraftNotes((event.notes ?? event.note ?? '').toString());
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-[#9747FF] text-white"
                  onClick={handleSave}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                {/* Delete */}
                <button
                  className={`px-4 py-2 rounded flex items-center gap-2 ${
                    isBooked ? 'bg-red-300 cursor-not-allowed' : 'bg-red-500 text-white'
                  }`}
                  onClick={handleDelete}
                  disabled={isBooked}
                  title={isBooked ? 'Booked slots cannot be deleted' : 'Delete this availability'}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>

                {/* Edit */}
                <button
                  className={`px-4 py-2 rounded flex items-center gap-2 ${
                    isBooked ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#9747FF] text-white'
                  }`}
                  onClick={() => setIsEditing(true)}
                  disabled={isBooked}
                  title={isBooked ? 'Booked slots cannot be edited' : 'Edit time and note'}
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
              </>
            )}
          </div>

          {/* Booked badge */}
          {isBooked && (
            <p className="text-xs text-gray-700 mt-3 italic">
              This slot is booked and can’t be modified or deleted.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
