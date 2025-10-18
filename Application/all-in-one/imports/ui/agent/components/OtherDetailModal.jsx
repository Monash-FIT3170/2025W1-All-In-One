import React, { useState, useMemo } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Meteor } from 'meteor/meteor';

export const OtherDetailModal = ({ event, onClose }) => {
  if (!event) return null;

  const startDate = useMemo(() => new Date(event.start), [event.start]);
  const endDate = useMemo(() => new Date(event.end), [event.end]);

  const [isEditing, setIsEditing] = useState(false);
  const [draftNotes, setDraftNotes] = useState((event.notes ?? '').toString());

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
    return `${new Date(start).toLocaleTimeString([], opts)} - ${new Date(end).toLocaleTimeString([], opts)}`;
  };

  const handleSaveNotes = () => {
    Meteor.call(
      'otherActivities.updateNotes',
      event._id || event.id,
      draftNotes,
      (err) => {
        if (err) {
          alert('Failed to update notes: ' + err.reason);
        } else {
          setIsEditing(false);
        }
      }
    );
  };

  const handleDelete = () => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;
    Meteor.call(
      'otherActivities.remove',
      event._id || event.id,
      (err) => {
        if (err) {
          alert('Failed to delete: ' + err.reason);
        } else {
          if (onClose) onClose();
        }
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="relative bg-[#CBADD8] p-6 rounded-xl w-[500px] shadow-lg">
        <button
          className="absolute top-4 right-4 text-2xl font-bold text-black hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-2">Other Activity</h2>
        <p className="text-lg font-medium text-gray-700 mb-1">{formatDate(startDate)}</p>
        <p className="text-lg font-medium text-gray-700 mb-4">{formatTime(startDate, endDate)}</p>

        {!isEditing ? (
          <div className="bg-white p-4 rounded-xl mb-4 min-h-[60px]">
            {draftNotes.trim() ? (
              <p className="whitespace-pre-line">{draftNotes}</p>
            ) : (
              <p className="italic text-gray-500">No notes yet.</p>
            )}
          </div>
        ) : (
          <textarea
            className="w-full border rounded p-2 bg-white min-h-[60px] mb-4"
            value={draftNotes}
            onChange={(e) => setDraftNotes(e.target.value)}
            placeholder="Add a note..."
          />
        )}

        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <button
                className="px-4 py-2 rounded bg-gray-300 text-black"
                onClick={() => {
                  setDraftNotes((event.notes ?? '').toString());
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-[#9747FF] text-white"
                onClick={handleSaveNotes}
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
                Edit Note
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};