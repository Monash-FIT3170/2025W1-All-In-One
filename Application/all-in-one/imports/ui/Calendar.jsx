import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ConfirmDialog } from './ConfirmDialog'; 
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { InspectionAvailabilities } from '../api/InspectionAvailabilities'; // Adjust path if needed



export const Calendar = () => {
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [newEvents, setNewEvents] = useState([]);

  const [showDialog, setShowDialog] = useState(false);

  const { availabilities, isLoading } = useTracker(() => {
    const handler = Meteor.subscribe('inspectionAvailabilities');
    const data = InspectionAvailabilities.find().fetch();
    return {
      availabilities: data,
      isLoading: !handler.ready(),
    };
  });
  
  const handleSelect = (info) => {
    const tempEvent = {
      id: Date.now(), 
      start: info.startStr,
      end: info.endStr,
      title: 'Pending',
      allDay: false
    };
    setNewEvents((prev) => [...prev, tempEvent]);
  };

  const handleConfirmButtonClick = () => {
    if (newEvents.length > 0) {
      setShowDialog(true);
    } else {
      alert('Please select at least one slot before confirming!');
    }
  };

  const handleConfirm = () => {
    newEvents.forEach(event => {
      Meteor.call('inspectionAvailabilities.insert', event.start, event.end, (error) => {
        if (error) {
          console.error('Failed to create availability:', error.reason);
        }
      });
    });
    setNewEvents([]);  
    setShowDialog(false);
  };
  
  
  
  
  const handleCancel = () => {
    setSelectedSlot(null);
    setShowDialog(false);
  };

  const handleClear = () => {
    Meteor.call('inspectionAvailabilities.clear', (error) => {
      if (error) {
        alert('Failed to clear availabilities: ' + error.reason);
      } else {
        alert('All availabilities have been cleared!');
      }
    });
  };
  
  

  return (
    <div className="bg-[#FFF8E9] min-h-screen p-8">
      
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Add Inspection Booking Availabilities</h2>
        <p className="text-gray-500 mt-2">Click empty timeslot to create Inspection Availability.</p>
        <p className="text-gray-500 mt-2">These will appear as timeslots for possible tenants to book inspections for any property.</p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-300 max-w-6xl mx-auto mb-6"></div>

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
          events={[
            ...availabilities.map(slot => ({
              id: slot._id,
              title: 'Available for Inspection',
              start: slot.start,
              end: slot.end,
              allDay: false
            })),
            ...newEvents
          ]}             
          eventTextColor='#24A89E'             
          eventBackgroundColor="#CEF4F1"
          eventBorderColor="#24A89E"
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
        <ConfirmDialog isOpen={showDialog} onConfirm={handleConfirm} onCancel={handleCancel}
        />

      </div>

      {/* Buttons */}
      <div className="flex justify-between max-w-6xl mx-auto mt-6">

        {/* Confirm */}
        <button onClick={handleConfirmButtonClick} className="bg-[#FFE284] hover:bg-yellow-200 text-black font-bold py-3 px-6 rounded-md">
          Confirm
        </button>

        {/* Clear */}
        <button onClick={handleClear} className="bg-red-400 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-md">
            Clear All 
        </button>
      </div>


    </div>
  );
};
