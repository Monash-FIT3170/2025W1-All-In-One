import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useTracker } from 'meteor/react-meteor-data';
import { AgentAvailabilities } from '../../../api/AgentAvailabilities';
import { BookingConfirmDialog } from './BookingConfirmDialog'; 
import { Meteor } from 'meteor/meteor'; 



export const InspectionCalendar = () => {
    const [selectedSlot, setSelectedSlot] = useState(null); // slot info
    const [showDialog, setShowDialog] = useState(false);
    const user = useTracker(() => (typeof Meteor.user === 'function' ? Meteor.user() : null));


  const { availabilities } = useTracker(() => {
    Meteor.subscribe('agentAvailabilities');
    return {
      availabilities: AgentAvailabilities.find().fetch(),
    };
  });

  const handleEventClick = (info) => {
    const availability = info.event.extendedProps;
  
    if (availability.status === 'booked') {
      alert('This slot has already been booked.');
      return;
    }
  
    setSelectedSlot({
      id: info.event.id,
      start: info.event.start,
      end: info.event.end,
      property: availability.property,
    });
    setShowDialog(true);
  };
  

  const handleConfirmBooking = () => {
    if (!selectedSlot) return;
  
    if (!user || !user._id) {
      alert("You must be logged in to book an inspection.");
      return;
    }
  
    const bookingData = {
      agentAvailabilityId: String(selectedSlot.id),
      tenantName: user?.profile?.name || 'Anonymous',
      tenantId: user._id, 
      start: new Date(selectedSlot.start),
      end: new Date(selectedSlot.end),
      property: selectedSlot.property,
      status: 'pending',
    };
  
    console.log("🚀 Booking data being sent to server:", bookingData);
  
    Meteor.call('tenantBookings.insert', bookingData, (err) => {
      if (err) {
        alert('Booking failed: ' + err.reason);
      } else {
        alert('Inspection booked successfully!');
        setShowDialog(false);
        setSelectedSlot(null);
      }
    });
  };
  
  
  const handleCancelBooking = () => {
    setShowDialog(false);
    setSelectedSlot(null);
  };

  
  return (
    <div className="bg-[#FFF8E9] min-h-screen p-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Book Inspection Time</h2>
        <p className="text-gray-600">Select the Inspection Timeslot that suits you best.</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg max-w-6xl mx-auto">
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          allDaySlot={false}
          slotMinTime="07:00:00"
          slotMaxTime="18:00:00"
          scrollTime="07:00:00"
          events={availabilities.map(slot => ({
            id: slot._id,
            start: slot.start,
            end: slot.end,
            title: slot.status === 'booked' ? 'Booked' : `${slot.type} Availability`,
            backgroundColor: slot.status === 'booked' ? '#e5e7eb' : '#CEF4F1',
            textColor: slot.status === 'booked' ? '#6b7280' : '#24A89E',
            borderColor: slot.status === 'booked' ? '#9ca3af' : '#24A89E',
            ...slot
          }))}
          eventClick={handleEventClick}
          headerToolbar={{
            left: 'prev today next',
            center: '',
            right: 'title'
          }}
          buttonText={{ today: 'Today' }}
          titleFormat={{ year: 'numeric', month: 'long' }}
          height="auto"
        />
        <BookingConfirmDialog
        isOpen={showDialog}
        onConfirm={handleConfirmBooking}
        onCancel={handleCancelBooking}
        />

      </div>
    </div>
  );
};
