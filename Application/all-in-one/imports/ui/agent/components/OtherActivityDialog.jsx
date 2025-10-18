import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';


export const OtherActivityDialog = ({ isOpen, pendingSlot, onSelect, onClose }) => {
  if (!isOpen) return null;

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
      if (pendingSlot && isOpen) {
        const start = dayjs(pendingSlot.start);
        const end = dayjs(pendingSlot.end);
        setStartTime(start.format('HH:mm'));
        setEndTime(end.format('HH:mm'));
        setDate(start.format('YYYY-MM-DD'));
        setTitle('');
        setNote('');
      }
    }, [pendingSlot, isOpen]);

  const handleSubmit = () => {
  if (!pendingSlot?.start || !pendingSlot?.end) {
    alert("Please select a time slot first");
    return;
  }

  const start = dayjs(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm').toDate();
  const end = dayjs(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm').toDate();

  onSelect({ start, end, title, notes: note });
};


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-[#CBADD8] p-6 rounded-xl shadow-lg w-[380px] text-left space-y-4 relative">
        <button
          className="absolute top-4 right-4 text-xl font-bold text-black hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-center text-gray-800">Schedule Activity</h2>

        <div>
          <h3 className="text-lg font-bold mb-2 text-black">Date and Time</h3>
          <p className="text-sm text-gray-800 mb-4">
            Enter the date, start and end time for this activity.
          </p>
          <div className="flex justify-between gap-3">
            <div className="flex flex-col w-1/3">
              <label className="text-sm font-semibold mb-1">Start time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="rounded-lg px-2 py-1 bg-yellow-50 border"
              />
            </div>
            <div className="flex flex-col w-1/3">
              <label className="text-sm font-semibold mb-1">End time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="rounded-lg px-2 py-1 bg-yellow-50 border"
              />
            </div>
            <div className="flex flex-col w-1/3">
              <label className="text-sm font-semibold mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg px-2 py-1 bg-yellow-50 border"
              />
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-black font-semibold mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Meeting with client"
            className="w-full px-4 py-2 rounded-lg bg-[#FFF8E9] border border-purple-400"
            maxLength={30}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-black font-semibold mb-1">Notes (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Bring pen & notepad"
            className="w-full h-24 px-4 py-2 rounded-lg bg-[#FFF8E9] border border-purple-400 resize-none"
            maxLength={300}
          />
        </div>

        <div className="text-center pt-2">
          <button
            onClick={handleSubmit}
            className="w-full bg-[#9747FF] hover:bg-purple-700 text-white font-bold py-3 rounded-full"
          >
            Create Activity 
          </button>
        </div>
      </div>
    </div>
 );
};