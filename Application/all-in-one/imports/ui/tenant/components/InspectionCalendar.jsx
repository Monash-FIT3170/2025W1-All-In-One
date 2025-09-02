import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useTracker } from 'meteor/react-meteor-data';
import { AgentAvailabilities, Properties } from '../../../api/database/collections';
import { BookingConfirmDialog } from './BookingConfirmDialog'; 
import { Meteor } from 'meteor/meteor'; 

export const InspectionCalendar = ({ propertyId, propertySnapshot }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  const userId = useTracker(() => Meteor.userId());
  const user = useTracker(() => Meteor.user());
  

  const { availabilities, property, isReady } = useTracker(() => {
    const propertiesHandle = Meteor.subscribe('properties');
    const availabilitiesHandle = Meteor.subscribe('allAvailableInspections');
    
    const ready = propertiesHandle.ready() && availabilitiesHandle.ready();
    
    let property = null;
    let availabilities = [];
    
    if (ready && propertyId) {
      // Get the property to find its agent_id
      property = Properties.findOne({ prop_id: propertyId });
      
      if (property && property.agent_id) {
        // Only get availabilities from the agent who manages this property
        availabilities = AgentAvailabilities.find({
        activity_type: 'Availability',
        type: 'Inspection', // exclude open houses              
        status: { $ne: 'booked' }, // exclude booked
        agent_id: property.agent_id
        }).fetch();
      }
    }
    
    return { availabilities, property, isReady: ready };
  }, [propertyId]);
  

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
      property: info.event.extendedProps.property,  // always an object
    });
    setShowDialog(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedSlot) return;

    const tenantId = Meteor.userId();
    const bookingData = {
      agentAvailabilityId: String(selectedSlot.id),
      tenantId,
      tenantName:
        user?.profile?.name ||
        user?.username ||
        user?.emails?.[0]?.address ||
        'Anonymous',
      start: new Date(selectedSlot.start),
      end: new Date(selectedSlot.end),
      property: {
        ...selectedSlot.property,
        id: propertyId,
      },
      status: 'booked', 
    };

    console.log("bookingData.property keys:", Object.keys(bookingData.property));

    Meteor.call('tenantBookings.insert', bookingData, (err) => {
      if (err) {
        alert('Booking failed: ' + err.reason);
      } else {
        alert('Booking confirmed!');
        setShowDialog(false);
        setSelectedSlot(null);
      }
    });
  };

  const handleCancelBooking = () => {
    setShowDialog(false);
    setSelectedSlot(null);
  };

  // Loading state
  if (!isReady) {
    return (
      <div className="bg-[#FFF8E9] min-h-screen p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Book Inspection Time</h2>
          <p className="text-gray-600">Loading available inspection times...</p>
        </div>
      </div>
    );
  }

  // No property found
  if (!property) {
    return (
      <div className="bg-[#FFF8E9] min-h-screen p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Book Inspection Time</h2>
          <p className="text-red-600">Property not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF8E9] min-h-screen p-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Book Inspection Time</h2>
        <p className="text-gray-600">
          Select the Inspection Timeslot that suits you best for this property.
          {availabilities.length === 0 && (
            <span className="block mt-2 text-orange-600">
              No inspection times currently available for this property.
            </span>
          )}
        </p>
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
            title: slot.status === 'booked'
              ? 'Booked'  
              : 'Inspection Availability',
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

