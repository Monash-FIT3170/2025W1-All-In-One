import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { mockData } from '/imports/api/database/mockData.js';

export const AvailabilityTypeDialog = ({ isOpen, pendingSlot, onSelect, onClose }) => {
  const [type, setType] = useState('Inspection');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [date, setDate] = useState('');
  const [property, setProperty] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (pendingSlot && isOpen) {
      const start = dayjs(pendingSlot.start);
      const end = dayjs(pendingSlot.end);
      setDate(start.format('YYYY-MM-DD'));
      setStartTime(start.format('HH:mm'));
      setEndTime(end.format('HH:mm'));
      setProperty(null);
      setShowSuggestions(false);
      setNote('');
    }
  }, [pendingSlot, isOpen]);

  const handleSubmit = () => {
    const start = dayjs(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm').toDate();
    const end = dayjs(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm').toDate();

    const selected = property && property.prop_address
      ? mockData.properties.find(p => p.prop_address === property.prop_address)
      : null;

    onSelect(type, start, end, {
      address: selected?.prop_address || property?.prop_address || '-',
      image: selected ? `/images/properties/${selected.prop_id}/main.jpg` : '/property.png',
      price: selected?.prop_pricepweek || '-',
      bedrooms: selected?.prop_numbeds || '-',
      bathrooms: selected?.prop_numbaths || '-',
      parking: selected?.prop_numcarspots || '-',
    }, note);
  };

  const filteredProperties = mockData.properties.filter(p =>
    p.prop_address.toLowerCase().includes((property?.prop_address || '').toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-[#CBADD8] p-6 rounded-3xl shadow-lg w-[440px] text-left space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl font-bold text-black hover:text-gray-700"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-center text-black">Availability Type</h2>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setType('Inspection')}
            className={`py-2 px-6 rounded-full font-semibold transition-all duration-150 ${
              type === 'Inspection' ? 'bg-[#9747FF] text-white' : 'bg-[#CDCDCD] text-black'
            }`}
          >
            Inspection
          </button>
          <button
            onClick={() => setType('Open House')}
            className={`py-2 px-6 rounded-full font-semibold transition-all duration-150 ${
              type === 'Open House' ? 'bg-[#9747FF] text-white' : 'bg-[#CDCDCD] text-black'
            }`}
          >
            Open House
          </button>
        </div>

        {type === 'Open House' && (
          <div>
            <label className="block text-black font-semibold mb-1">Property</label>
            <input
              type="text"
              placeholder="Search Property..."
              value={property?.prop_address || ''}
              onChange={(e) => {
                setProperty({ prop_address: e.target.value });
                setShowSuggestions(true);
              }}
              className="w-full px-4 py-2 rounded-lg bg-[#FFF8E9] border border-purple-400"
            />
            {showSuggestions && property?.prop_address && (
              <div className="mt-1 border rounded bg-white max-h-40 overflow-y-auto shadow">
                {filteredProperties.length > 0 ? (
                  filteredProperties.map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setProperty(p);
                        setShowSuggestions(false);
                      }}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                      {p.prop_address}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">No matches found</div>
                )}
              </div>
            )}
          </div>
        )}

        <div>
          <h3 className="text-lg font-bold mb-2 text-black">Date and Time</h3>
          <p className="text-sm text-gray-800 mb-4">
            The start and end time entered will appear as a timeslot for possible tenants to book inspections for any property.
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

        {/* Notes */}
        <div>
          <label className="block text-black font-semibold mb-1">Notes (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="i.e., Bring pen & notepad"
            className="w-full h-24 px-4 py-2 rounded-lg bg-[#FFF8E9] border border-purple-400 resize-none"
          />
        </div>

        <div className="text-center pt-2">
          <button
            onClick={handleSubmit}
            className="w-full bg-[#9747FF] hover:bg-purple-700 text-white font-bold py-3 rounded-full"
          >
            Create Availability
          </button>
        </div>
      </div>
    </div>
  );
};