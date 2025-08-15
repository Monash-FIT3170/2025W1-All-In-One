import React, { useState , useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { AgentAvailabilities } from '../../../api/database/collections';
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

function toDatetimeLocal(date) {
  if (!date) return '';
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0,16);
}

export const Calendar = () => {
  const [newEvents, setNewEvents] = useState([]);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showAvailabilityTypeDialog, setShowAvailabilityTypeDialog] = useState(false);
  const [showOpenHouseDialog, setShowOpenHouseDialog] = useState(false);
  const [showActivityTypeDialog, setShowActivityTypeDialog] = useState(false);
  const [pendingSlot, setPendingSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null); 
  const [editEvent, setEditEvent] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const closeDialogs = () => {
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

  const handleAvailabilityTypeSelect = (type, start, end, propertyInfo, note) => {
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
      note,
    });
  };

  const handleBookingSelect = async ({ type, start, end, address, price, bedrooms, bathrooms, parking, image, note }) => {
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
      note,
      allDay: false,
    };

    // Immediately insert into DB
    try {
      await callAsync(
        'agentAvailabilities.insert',
        start.toISOString(),
        end.toISOString(),
        'Availability',
        type,
        tempEvent.property,
        String(price ?? ''),
        String(bedrooms ?? ''),
        String(bathrooms ?? ''),
        String(parking ?? ''),
        String(image ?? ''),
        'confirmed',
        String(note ?? '')
      );
    } catch (error) {
      alert('Insert failed: ' + error.reason);
      console.error('Failed to create availability:', error.reason);
      return;
    }

    setPendingSlot(null);
    setShowOpenHouseDialog(false);
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
          event.property,
          String(event.price ?? ''),
          String(event.bedrooms ?? ''),
          String(event.bathrooms ?? ''),
          String(event.parking ?? ''),
          String(event.image ?? ''),
          'confirmed',
          String(event.note ?? ''),
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

  // Add this function to extract details for booked events
  const handleEventClick = (info) => {
    // Only allow editing if the event has a Mongo _id
    if (!info.event.id || (info.event.id.length !== 17 && info.event.id.length !== 24)) {
      alert('You can only edit saved availabilities.');
      return;
    }

    // If the event is booked, show detailed info
    if (info.event.extendedProps.status === 'booked') {
      setSelectedEvent({
        id: info.event.id,
        title: info.event.title,
        start: info.event.start,
        end: info.event.end,
        ...info.event.extendedProps,
      });
      return;
    }

    // Otherwise, open edit dialog as before
    setEditEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      ...info.event.extendedProps,
    });
    setShowEditDialog(true);
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
              id: slot._id, // This is the real Mongo _id
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
            setSelectedEvent({
              title: info.event.title,
              start: info.event.start,
              end: info.event.end,
              ...clicked,
            }); 
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

        <ClearDialog isOpen={showClearDialog} onConfirm={handleClearConfirm} onCancel={closeDialogs} />
        <ActivityTypeDialog isOpen={showActivityTypeDialog} onSelect={handleActivityTypeSelect} onClose={closeDialogs} />
        <AvailabilityTypeDialog 
          isOpen={showAvailabilityTypeDialog} 
          pendingSlot={pendingSlot}
          onSelect={handleAvailabilityTypeSelect}
          onClose={closeDialogs} 
        />
      </div>

      {/* Show event detail modal for booked events */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {showEditDialog && editEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Availability</h2>
            <label className="block mb-2">Start Time</label>
            <input
              type="datetime-local"
              className="w-full mb-4 border rounded p-2"
              value={toDatetimeLocal(editEvent.start)}
              onChange={e => setEditEvent(ev => ({ ...ev, start: new Date(e.target.value) }))}
            />
            <label className="block mb-2">End Time</label>
            <input
              type="datetime-local"
              className="w-full mb-4 border rounded p-2"
              value={toDatetimeLocal(editEvent.end)}
              onChange={e => setEditEvent(ev => ({ ...ev, end: new Date(e.target.value) }))}
            />
            {/* Add more fields as needed */}
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={async () => {
                  try {
                    const id = String(editEvent.id);
                    await callAsync('agentAvailabilities.remove', id);
                    setShowEditDialog(false);
                    setEditEvent(null);
                  } catch (error) {
                    alert('Delete failed: ' + error.reason);
                    console.error('Failed to delete availability:', error);
                  }
                }}
              >
                Delete
              </button>
              <button
                className="bg-purple-500 text-white px-4 py-2 rounded"
                onClick={async () => {
                  try {
                    const id = String(editEvent.id);
                    const updateData = {
                      start: editEvent.start instanceof Date ? editEvent.start.toISOString() : editEvent.start,
                      end: editEvent.end instanceof Date ? editEvent.end.toISOString() : editEvent.end,
                    };
                    await callAsync('agentAvailabilities.update', id, updateData);
                    setShowEditDialog(false);
                    setEditEvent(null);
                  } catch (error) {
                    alert('Update failed: ' + error.reason);
                    console.error('Failed to update availability:', error);
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between max-w-6xl mx-auto mt-6">
        <button onClick={handleClearButtonClick} className="bg-red-500 hover:bg-red-400 text-white font-bold py-3 px-6 rounded-md">
          Clear
        </button>
      </div>
    </div>
  );
};
