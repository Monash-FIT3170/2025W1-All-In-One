import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';

export const Calendar = () => {
  const [selectedSlot, setSelectedSlot] = useState(null);

  return (
    <div className="bg-[#FFF8E9] min-h-screen p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Add Inspection Booking Availabilities</h2>
        <p className="text-gray-500 mt-2">Click empty timeslot to create Inspection Availability. </p>
        <p className="text-gray-500 mt 2">These will appear as timeslots for possible tenants to book inspections for any property.</p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-300 max-w-6xl mx-auto mb-6"></div>

      {/* Calendar */}
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-6xl mx-auto">
        <FullCalendar
          plugins={[timeGridPlugin]}
          initialView="timeGridWeek"
          slotMinTime="07:00:00"
          slotMaxTime="18:00:00"
          scrollTime="07:00:00"
          allDaySlot={false}
          selectable={true}
          events={[
            { title: 'Inspection Availability', start: '2025-03-25T10:00:00' },
            { title: 'Inspection Availability', start: '2025-03-26T09:00:00' },
            { title: 'Inspection Availability', start: '2025-03-26T10:00:00' },
            { title: 'Inspection Availability', start: '2025-03-27T10:00:00' },
            { title: 'Inspection Availability', start: '2025-03-27T15:00:00' },
          ]}
          eventBackgroundColor="#D6F2F2"
          eventBorderColor="#D6F2F2"
          headerToolbar={{
            left: 'prev today next',
            center: '',
            right: 'title'
          }}
          buttonText={{
            today: 'Today'
          }}
          titleFormat={{ 
            year: 'numeric', month: 'long' 
          }}
          height="auto"
          eventClick={(info) => setSelectedSlot(info.event.start)}
        />
      </div>

      {/* Confirm Button */}
      <div className="flex justify-start max-w-6xl mx-auto mt-6">
        <button className="bg-[#FFE284] hover:bg-yellow-200 text-black font-bold py-3 px-6 rounded-md">
          Confirm
        </button>
      </div>
    </div>
  );
};
