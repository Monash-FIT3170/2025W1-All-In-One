import React, { useMemo, useState } from 'react';
import { BedDouble, ShowerHead, CarFront, Pencil, Trash2 } from 'lucide-react';
import { Meteor } from 'meteor/meteor';

export const EventDetailModal = ({ event, onClose }) => {
  if (!event) return null;

  // If event.extendedProps exists, merge it in
  const mergedEvent = event.extendedProps
    ? { ...event, ...event.extendedProps }
    : event;

  const isUnbookedInspection =
    (!mergedEvent.status || mergedEvent.status === 'pending' || mergedEvent.status === 'confirmed') &&
    (
      (mergedEvent.type && mergedEvent.type.toLowerCase().includes('inspection')) ||
      (mergedEvent.title && mergedEvent.title.toLowerCase().includes('inspection'))
    ) &&
    (!mergedEvent.tenant || !mergedEvent.tenant.name);

  const startDate = useMemo(() => new Date(mergedEvent.start), [mergedEvent.start]);
  const endDate   = useMemo(() => new Date(mergedEvent.end),   [mergedEvent.end]);

  const [isEditing, setIsEditing] = useState(false);
  const [draftStart, setDraftStart] = useState(toLocalInputValue(startDate));
  const [draftEnd, setDraftEnd]     = useState(toLocalInputValue(endDate));
  const [draftNotes, setDraftNotes] = useState((mergedEvent.notes ?? mergedEvent.note ?? '').toString());

  const isBooked = mergedEvent.status === 'booked';

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
    return `${day}${['st','nd','rd'][((day+90)%100-10)%10-1]||'th'} ${month}`;
  };
  const formatTime = (start, end) => {
    const opts = { hour: 'numeric', minute: '2-digit', hour12: true };
    return `${new Date(start).toLocaleTimeString([], opts)} - ${new Date(end).toLocaleTimeString([], opts)}`;
  };

  const handleSave = () => {
    Meteor.call(
      'agentAvailabilities.update',
      mergedEvent._id || mergedEvent.id,
      {
        start: new Date(draftStart).toISOString(),
        end: new Date(draftEnd).toISOString(),
        note: draftNotes,
        notes: draftNotes,
      },
      (err) => {
        if (err) {
          alert('Failed to update: ' + err.reason);
        } else {
          setIsEditing(false);
          if (onClose) onClose();
        }
      }
    );
  };

  const handleDelete = () => {
    if (!window.confirm('Are you sure you want to delete this availability?')) return;
    Meteor.call(
      'agentAvailabilities.remove',
      mergedEvent._id || mergedEvent.id,
      (err) => {
        if (err) {
          alert('Failed to delete: ' + err.reason);
        } else {
          if (onClose) onClose();
        }
      }
    );
  };

  // --- Render for unbooked inspection: allow edit/delete ---
  if (isUnbookedInspection) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
        <div
          className="relative bg-[#D6B4E7] p-10 rounded-[40px] w-full max-w-3xl"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {/* Close (X) button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-8 text-black text-2xl"
            aria-label="Close"
            style={{ lineHeight: 1 }}
          >
            ×
          </button>

          <div className="flex flex-col gap-2">
            {/* Date and Time */}
            {!isEditing ? (
              <>
                <div className="text-[2.5rem] font-bold mb-0" style={{ lineHeight: 1 }}>
                  {formatDate(mergedEvent.start)}
                </div>
                <div className="text-xl mb-4" style={{ marginTop: '-0.5rem' }}>
                  {formatTime(mergedEvent.start, mergedEvent.end)}
                </div>
              </>
            ) : (
              <div className="flex gap-4 mb-4">
                <div className="flex flex-col flex-1">
                  <label className="font-bold text-lg mb-1">Start</label>
                  <input
                    type="datetime-local"
                    className="bg-white border rounded px-3 py-2"
                    value={draftStart}
                    onChange={e => setDraftStart(e.target.value)}
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <label className="font-bold text-lg mb-1">End</label>
                  <input
                    type="datetime-local"
                    className="bg-white border rounded px-3 py-2"
                    value={draftEnd}
                    onChange={e => setDraftEnd(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="text-2xl font-bold mb-6">
              Available for Routine Inspection
            </div>
            <div className="flex gap-8 mb-4">
              <div className="flex-1">
                <div className="font-bold text-lg mb-2">Address</div>
                <div className="bg-[#FFF8E9] border-dashed border-2 border-[#E7E1D6] rounded-xl px-6 py-4 text-center text-gray-500 italic text-lg shadow">
                  Awaiting Tenant Inspection Booking
                </div>
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg mb-2">Tenant</div>
                <div className="bg-[#FFF8E9] border-dashed border-2 border-[#E7E1D6] rounded-xl px-6 py-4 text-center text-gray-500 italic text-lg shadow">
                  Awaiting Tenant Inspection Booking
                </div>
              </div>
            </div>
            <div className="font-bold text-lg mb-2">Notes</div>
            {!isEditing ? (
              <div className="bg-[#FFF8E9] rounded-xl px-4 py-4 min-h-[60px] text-base flex items-center">
                <span className="flex-1">{(mergedEvent.notes ?? mergedEvent.note ?? '').toString() || <span className="italic text-gray-500">No notes yet.</span>}</span>
              </div>
            ) : (
              <textarea
                className="bg-[#FFF8E9] rounded-xl px-4 py-4 min-h-[60px] text-base w-full"
                value={draftNotes}
                onChange={e => setDraftNotes(e.target.value)}
                placeholder="Add a note for this availability..."
              />
            )}

            {/* Buttons row */}
            <div className="mt-6 flex flex-wrap gap-2 justify-end">
              {isEditing ? (
                <>
                  <button
                    className="px-4 py-2 rounded bg-gray-300 text-black"
                    onClick={() => {
                      setDraftStart(toLocalInputValue(startDate));
                      setDraftEnd(toLocalInputValue(endDate));
                      setDraftNotes((mergedEvent.notes ?? mergedEvent.note ?? '').toString());
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
                  <button
                    className="px-4 py-2 rounded flex items-center gap-2 bg-red-500 text-white"
                    onClick={handleDelete}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                  <button
                    className="px-4 py-2 rounded flex items-center gap-2 bg-[#9747FF] text-white"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
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
            {mergedEvent.type || ''}
          </h2>

          <img
            src={mergedEvent.property?.image || mergedEvent.image || '/images/default.jpg'}
            alt="Property"
            className="rounded-xl mb-2 w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/default.jpg';
            }}
          />

          <div className="bg-[#FFF8E9] p-4 rounded-xl">
            {mergedEvent.property ? (
              <>
                <p className="text-center text-gray-700">
                  {mergedEvent.property.address || 'No address available'}
                </p>

                {mergedEvent.property.price && (
                  <p className="text-center text-sm text-gray-700">
                    ${mergedEvent.property.price} per week
                  </p>
                )}

                <div className="flex justify-center gap-6 text-sm text-gray-600 mt-2">
                  <div className="flex items-center gap-1">
                    <BedDouble className="w-4 h-4" />
                    {mergedEvent.property.bedrooms ?? '—'}
                  </div>
                  <div className="flex items-center gap-1">
                    <ShowerHead className="w-4 h-4" />
                    {mergedEvent.property.bathrooms ?? '—'}
                  </div>
                  <div className="flex items-center gap-1">
                    <CarFront className="w-4 h-4" />
                    {mergedEvent.property.parking ?? '—'}
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
              <label className={`text-sm font-semibold ${isBooked ? 'text-gray-400' : 'text-gray-800'}`}>Start</label>
              <input
                type="datetime-local"
                className="w-full border rounded p-2 bg-white disabled:bg-gray-100"
                value={draftStart}
                onChange={(e) => setDraftStart(e.target.value)}
                disabled={isBooked}
              />
              <label className={`text-sm font-semibold ${isBooked ? 'text-gray-400' : 'text-gray-800'}`}>End</label>
              <input
                type="datetime-local"
                className="w-full border rounded p-2 bg-white disabled:bg-gray-100"
                value={draftEnd}
                onChange={(e) => setDraftEnd(e.target.value)}
                disabled={isBooked}
              />
              {isBooked && (
                <p className="text-xs text-gray-600 -mt-1">
                  Time is locked for booked slots. You can still update the note below.
                </p>
              )}
            </div>
          )}

          {isBooked && mergedEvent.tenant && (
            <div className="bg-white p-4 rounded-xl mt-4 text-sm text-gray-700">
              <p className="font-semibold mb-1">Booked For</p>
              <p>{mergedEvent.tenant.name}</p>
              {/* Add more tenant fields later if you store them */}
            </div>
          )}

          {/* Notes */}
          {!isEditing ? (
            (mergedEvent.notes?.trim() || mergedEvent.note?.trim()) ? (
              <div className="bg-white p-4 rounded-xl mt-4 text-sm text-gray-700">
                <p className="font-semibold mb-1">Note</p>
                <p className="whitespace-pre-line">{mergedEvent.notes ?? mergedEvent.note}</p>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-xl mt-4 text-sm text-gray-500 italic">
                No notes yet.
              </div>
            )
          ) : (
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
          <div className="mt-6 flex flex-wrap gap-2 justify-end">
            {isEditing ? (
              <>
                <button
                  className="px-4 py-2 rounded bg-gray-300 text-black"
                  onClick={() => {
                    setDraftStart(toLocalInputValue(startDate));
                    setDraftEnd(toLocalInputValue(endDate));
                    setDraftNotes((mergedEvent.notes ?? mergedEvent.note ?? '').toString());
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
                {/* Delete (blocked if booked) */}
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

                {/* Single EDIT button */}
                <button
                  className="px-4 py-2 rounded flex items-center gap-2 bg-[#9747FF] text-white"
                  onClick={() => setIsEditing(true)}
                  title={isBooked ? 'Edit note (time locked)' : 'Edit time and note'}
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
                {isBooked && (
                  <p className="text-xs text-gray-700 mt-3 italic">
                    This slot is booked. Booked slots cannot be deleted but notes are still editable.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
