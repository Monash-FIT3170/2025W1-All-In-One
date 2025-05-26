import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export const InspectionCalendar = () => {
  const [bookedEvents, setBookedEvents] = useState([]);

  const handleSelect = (info) => {
    const newEvent = {
      id: Date.now(),
      title: 'Pending: Inspection',
      start: info.start,
      end: info.end,
      allDay: false,
      backgroundColor: '#F2F2F2',
      textColor: '#000000',
      borderColor: '#000000'
    };

    setBookedEvents((prev) => [...prev, newEvent]);
  };

  return (
    <div className="bg-[#FFF8E9] min-h-screen p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Book Inspection Time</h2>
        <p className="text-gray-600">Select the Inspection Timeslot that suits you best.</p>
      </div>

      {/* Calendar */}
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-6xl mx-auto">
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          slotMinTime="07:00:00"
          slotMaxTime="18:00:00"
          scrollTime="07:00:00"
          allDaySlot={false}
          selectable={true}
          select={handleSelect}
          events={bookedEvents}
          headerToolbar={{
            left: 'prev today next',
            center: '',
            right: 'title'
          }}
          buttonText={{ today: 'Today' }}
          titleFormat={{ year: 'numeric', month: 'long' }}
          height="auto"
        />
      </div>
      {/* Buttons */}
      <div className="flex justify-between max-w-6xl mx-auto mt-6">
        <button
            className="bg-[#9747FF] hover:bg-purple-400 text-white font-semibold text-lg py-3 px-6 rounded-md transition"
        >
            Confirm
        </button>

        <button
            className="bg-red-500 hover:bg-red-400 text-white font-semibold text-lg py-3 px-6 rounded-md transition"
        >
            Clear
        </button>
        </div>
    </div>
  );
};
