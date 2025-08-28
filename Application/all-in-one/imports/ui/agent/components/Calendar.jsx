import React, { useState , useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ConfirmDialog } from './ConfirmDialog.jsx'; 
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { AgentAvailabilities } from '../../../api/AgentAvailabilities.js';
import { ClearDialog } from './ClearDialog.jsx'; 
import { AvailabilityTypeDialog } from './AvailabilityTypeDialog.jsx'; 
import { ActivityTypeDialog } from './ActivityTypeDialog.jsx'; 
import { EventDetailModal } from './EventDetailModal.jsx'; 

const callAsync = (methodName, ...args) => {
  return new Promise((resolve, reject) => {
    Meteor.call(methodName, ...args, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
};

export const Calendar = () => {
  const [newEvents, setNewEvents] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showAvailabilityTypeDialog, setShowAvailabilityTypeDialog] = useState(false);
  const [showOpenHouseDialog, setShowOpenHouseDialog] = useState(false);
  const [showActivityTypeDialog, setShowActivityTypeDialog] = useState(false);
  const [pendingSlot, setPendingSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null); 

  const closeDialogs = () => {
    setShowDialog(false);
    setShowClearDialog(false);
    setShowActivityTypeDialog(false);
    setShowAvailabilityTypeDialog(false);
    setShowOpenHouseDialog(false);
    setPendingSlot(null);
    setSelectedEvent(null);
  };

  const { availabilities, isLoading } = useTracker(() => {
    const handler = Meteor.subscribe('agentAvailabilities');
    const data = AgentAvailabilities.find().fetch();
    return {
      availabilities: data,
      isLoading: !handler.ready(),
    };
  });

  const handleSelect = (info) => {
    setPendingSlot({ start: info.start, end: info.end });
    setShowActivityTypeDialog(true);
  };

  const handleActivityTypeSelect = (activity_type) => {
    if (activity_type === 'Availability') {
      setShowActivityTypeDialog(false);
      setShowAvailabilityTypeDialog(true);
    }
  };

  const handleAvailabilityTypeSelect = (type, start, end, propertyInfo) => {
    setShowAvailabilityTypeDialog(false);

    const {
      address,
      price,
      bedrooms,
      bathrooms,
      parking,
      image,
    } = propertyInfo;

    console.log('[Calendar] propertyInfo:', propertyInfo);

    handleBookingSelect({
      type,
      start,
      end,
      address, 
      price,
      bedrooms,
      bathrooms,
      parking,
      image,
    });
  };

  const handleBookingSelect = ({ type, start, end, address, price, bedrooms, bathrooms, parking, image }) => {
    const tempEvent = {
      id: Date.now(),
      start,
      end,
      type,
      status: 'pending',
      title: `Pending: ${type} Availability`,
      property: {
        address,
        price,
        bedrooms,
        bathrooms,
        parking,
        image,
      },
      price,
      bedrooms,
      bathrooms,
      parking,
      image,
      allDay: false,
    };
  
    setNewEvents((prev) => [...prev, tempEvent]);
    setPendingSlot(null);
    setShowOpenHouseDialog(false);
  };
  

  const handleConfirmButtonClick = () => {
    setShowDialog(true); 
  };

  const handleClearButtonClick = () => {
    setShowClearDialog(true);   
  };

  const handleConfirm = async () => {
    try {
      for (const event of newEvents) {
        await callAsync(
          'agentAvailabilities.insert',
          event.start.toISOString(),
          event.end.toISOString(),
          'Availability',
          event.type,
          event.property, // ✅ now guaranteed to be an object
          String(event.price ?? ''),
          String(event.bedrooms ?? ''),
          String(event.bathrooms ?? ''),
          String(event.parking ?? ''),
          String(event.image ?? ''),
          'confirmed'
        );
      }

      setNewEvents([]);
      setShowDialog(false);
    } catch (error) {
      alert('Insert failed: ' + error.reason);
      console.error('Failed to create availability:', error.reason);
    }
  };

  const handleClearConfirm = () => {
    Meteor.call('agentAvailabilities.clear', (error) => {
      if (error) {
        console.error('Failed to clear availabilities: ' + error.reason);
      } else {
        console.log('All availabilities cleared!');
        setNewEvents([]); 
        setShowClearDialog(false);
        Meteor.subscribe('agentAvailabilities'); 
      }
    });
  };

  return (
    <div className="bg-[#FFF8E9] min-h-screen p-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Calendar</h2>
        <p className="text-gray-500 mt-2">Click empty timeslot to schedule an activity - an availability (inspection or open house) or maintenance (to be added in Milestone 3).</p>
      </div>

      <div className="border-t border-gray-300 max-w-6xl mx-auto mb-6"></div>

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
              ...slot,
              id: slot._id,
              title: slot.status === 'booked'
                ? 'Booked'
                : `${slot.type} Availability`,
              backgroundColor:
                slot.status === 'booked'
                  ? '#e5e7eb'
                  : slot.status === 'pending'
                  ? '#F2F2F2'
                  : slot.type === 'Open House'
                  ? '#DCFFCD'
                  : '#CEF4F1',
              textColor:
                slot.status === 'booked'
                  ? '#6b7280'
                  : slot.status === 'pending'
                  ? '#000000'
                  : slot.type === 'Open House'
                  ? '#68A44F'
                  : '#24A89E',
              borderColor:
                slot.status === 'booked'
                  ? '#9ca3af'
                  : slot.status === 'pending'
                  ? '#000000'
                  : slot.type === 'Open House'
                  ? '#A98A22'
                  : '#24A89E',
            })),
            ...newEvents.map(event => ({
              ...event,
              backgroundColor: '#F2F2F2',
              textColor: '#000000',
              borderColor: '#000000',
            })),
          ]}                   
          eventClick={(info) => {
            const clicked = info.event.extendedProps;
            if (clicked.type === 'Open House') {
              setSelectedEvent({
                title: info.event.title,
                start: info.event.start,
                end: info.event.end,
                ...clicked,
              });
            } 
          }}          
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

        <ConfirmDialog isOpen={showDialog} onConfirm={handleConfirm} onCancel={closeDialogs} />
        <ClearDialog isOpen={showClearDialog} onConfirm={handleClearConfirm} onCancel={closeDialogs} />
        <ActivityTypeDialog isOpen={showActivityTypeDialog} onSelect={handleActivityTypeSelect} onClose={closeDialogs} />
        <AvailabilityTypeDialog 
          isOpen={showAvailabilityTypeDialog} 
          pendingSlot={pendingSlot}
          onSelect={handleAvailabilityTypeSelect}
          onClose={closeDialogs} 
        />
      </div>

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      <div className="flex justify-between max-w-6xl mx-auto mt-6">
        <button onClick={handleConfirmButtonClick} disabled={newEvents.length === 0} className={`font-bold py-3 px-6 rounded-md ${newEvents.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#9747FF] hover:bg-purple-200 text-white'}`}>
          Confirm 
        </button>
        <button onClick={handleClearButtonClick} className="bg-red-500 hover:bg-red-400 text-white font-bold py-3 px-6 rounded-md">
          Clear
        </button>
      </div>
    </div>
  );
};
