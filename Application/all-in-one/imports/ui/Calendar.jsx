import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ConfirmDialog } from './ConfirmDialog'; 
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { InspectionAvailabilities } from '../api/InspectionAvailabilities';
import { ClearDialog } from './ClearDialog'; 
import { BookingDialog } from './BookingDialog';




export const Calendar = () => {
  const [newEvents, setNewEvents] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [pendingSlot, setPendingSlot] = useState(null);

  const { availabilities, isLoading } = useTracker(() => {
    const handler = Meteor.subscribe('inspectionAvailabilities');
    const data = InspectionAvailabilities.find().fetch();
    return {
      availabilities: data,
      isLoading: !handler.ready(),
    };
  });
  
  const handleSelect = (info) => {
    setPendingSlot({
      start: info.startStr,
      end: info.endStr,
    });
    setShowBookingDialog(true);
  };

  const handleBookingSelect = (type) => {
    const tempEvent = {
      id: Date.now(),
      start: pendingSlot.start,
      end: pendingSlot.end,
      title: `Pending: ${type}`,
      allDay: false
    };
    setNewEvents((prev) => [...prev, tempEvent]);
    setPendingSlot(null);
    setShowBookingDialog(false);
  };
  
  const handleConfirmButtonClick = () => {

    setShowDialog(true); 
  };

  const handleClearButtonClick = () => {
    setShowClearDialog(true);   
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
    // window.location.reload(); reload for confirm button
  };
  
  const handleClearConfirm = () => {
    Meteor.call('inspectionAvailabilities.clear', (error) => {
      if (error) {
        console.error('Failed to clear availabilities: ' + error.reason);
      } else {
        // window.location.reload(); reload for clear button
      }
    });
    setNewEvents([]); // Q: Should I also clear pending tasks?
    setShowClearDialog(false);
  };

  const handleCancel = () => {
    setNewEvents([]);
    setShowDialog(false);
  };
  
  const handleClearCancel = () => {
    setShowClearDialog(false);
  };
  
  
  return (
    <div className="bg-[#FFF8E9] min-h-screen p-8">

      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Add Booking Availabilities</h2>
        <p className="text-gray-500 mt-2">Click empty timeslot to create Booking Availability.</p>
        <p className="text-gray-500 mt-2">These will appear as timeslots for possible tenants to book inspections or openhouse for any property.</p>
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
        />
        <ConfirmDialog isOpen={showDialog} onConfirm={handleConfirm} onCancel={handleCancel}
        />
        <ClearDialog isOpen={showClearDialog} onConfirm={handleClearConfirm} onCancel={handleClearCancel} 
        />
        <BookingDialog isOpen={showBookingDialog} onSelect={handleBookingSelect} 
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-between max-w-6xl mx-auto mt-6">

        {/* Confirm */}
        <button onClick={handleConfirmButtonClick} disabled={newEvents.length === 0}className={`font-bold py-3 px-6 rounded-md ${newEvents.length === 0? 'bg-gray-300 cursor-not-allowed': 'bg-[#FFE284] hover:bg-yellow-200 text-black'}`}>
            Confirm 
        </button>


        <button onClick={handleClearButtonClick} className="bg-red-500 hover:bg-red-400 text-white font-bold py-3 px-6 rounded-md">
            Clear All
        </button>

      </div>


    </div>
  );
}