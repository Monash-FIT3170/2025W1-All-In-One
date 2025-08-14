// imports/ui/agent/Calendar.jsx
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';

import { ConfirmDialog } from './ConfirmDialog.jsx';
import { ClearDialog } from './ClearDialog.jsx';
import { AvailabilityTypeDialog } from './AvailabilityTypeDialog.jsx';
import { ActivityTypeDialog } from './ActivityTypeDialog.jsx';
import { TicketTypeDialog } from './TicketTypeDialog.jsx';
import { TicketActivityDialog } from './TicketActivityDialog.jsx';
import { EventDetailModal } from './EventDetailModal.jsx';
import { AgentAvailabilities } from '../../../api/AgentAvailabilities.js';

const callAsync = (methodName, ...args) =>
  new Promise((resolve, reject) => {
    Meteor.call(methodName, ...args, (err, res) => (err ? reject(err) : resolve(res)));
  });

export const Calendar = () => {
  const [newEvents, setNewEvents] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showAvailabilityTypeDialog, setShowAvailabilityTypeDialog] = useState(false);
  const [showOpenHouseDialog, setShowOpenHouseDialog] = useState(false);
  const [showActivityTypeDialog, setShowActivityTypeDialog] = useState(false);

  // 👇 these are for the ticket flow
  const [showTicketTypeDialog, setShowTicketTypeDialog] = useState(false);
  const [showTicketActivityDialog, setShowTicketActivityDialog] = useState(false);
  const [selectedTicketForActivity, setSelectedTicketForActivity] = useState(null);

  const [pendingSlot, setPendingSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // This closes EVERYTHING and clears the slot — use it only when you truly want to reset all.
  const closeDialogs = () => {
    setShowDialog(false);
    setShowClearDialog(false);
    setShowActivityTypeDialog(false);
    setShowAvailabilityTypeDialog(false);
    setShowTicketTypeDialog(false);
    setShowOpenHouseDialog(false);
    setShowTicketActivityDialog(false);
    setPendingSlot(null);                 // ← this clears the slot!
    setSelectedEvent(null);
    setSelectedTicketForActivity(null);
  };

  // 👇 helper: close only the ticket picker (KEEP the slot)
  const closeTicketPicker = () => setShowTicketTypeDialog(false);

  const { availabilities, isLoading } = useTracker(() => {
    const handler = Meteor.subscribe('agentAvailabilities');
    const data = AgentAvailabilities.find().fetch();
    return { availabilities: data, isLoading: !handler.ready() };
  });

  // When the user drags/clicks a slot on the calendar
  const handleSelect = (info) => {
    setPendingSlot({ start: info.start, end: info.end }); // keep the slot
    setShowActivityTypeDialog(true);                      // open "choose activity" dialog
  };

  // From the "choose activity" dialog
  const handleActivityTypeSelect = (activity_type) => {
    setShowActivityTypeDialog(false);
    if (activity_type === 'Availability') {
      setShowAvailabilityTypeDialog(true);
    } else if (activity_type === 'Ticket') {
      setShowTicketTypeDialog(true); // open the ticket picker (do NOT clear pendingSlot)
    }
  };

  // Availability flow (unchanged)
  const handleAvailabilityTypeSelect = (type, start, end, propertyInfo) => {
    setShowAvailabilityTypeDialog(false);
    const { address, price, bedrooms, bathrooms, parking, image } = propertyInfo;

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
      property: { address, price, bedrooms, bathrooms, parking, image },
      price, bedrooms, bathrooms, parking, image,
      allDay: false,
    };

    setNewEvents((prev) => [...prev, tempEvent]);
    setShowOpenHouseDialog(false);
    // keep pendingSlot if you want to keep editing; or clear it here if done
  };

  // Confirm/clear buttons for availability flow (unchanged)
  const handleConfirmButtonClick = () => setShowDialog(true);
  const handleClearButtonClick = () => setShowClearDialog(true);

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
          'confirmed'
        );
      }
      setNewEvents([]);
      setShowDialog(false);
    } catch (error) {
      alert('Insert failed: ' + (error.reason || error.message));
      console.error('Failed to create availability:', error);
    }
  };

  const handleClearConfirm = () => {
    Meteor.call('agentAvailabilities.clear', (error) => {
      if (error) {
        console.error('Failed to clear availabilities: ' + error.reason);
      } else {
        setNewEvents([]);
        setShowClearDialog(false);
        Meteor.subscribe('agentAvailabilities');
      }
    });
  };

  // 👇 Ticket flow handlers
  const handleTicketChosen = (ticket) => {
    // called by TicketTypeDialog.onSelect
    setSelectedTicketForActivity(ticket);
    setShowTicketTypeDialog(false);      // close the picker
    setShowTicketActivityDialog(true);   // open Ticket Activity, WITH the same pendingSlot
    // NOTE: do NOT clear pendingSlot here
  };

  const handleCreateTicketActivity = ({ start, end, notes, ticket }) => {
    // TODO: insert your server-side method here if needed
    // Example: create a local pending event so it shows on the calendar immediately
    setNewEvents((prev) => [
      ...prev,
      {
        id: Date.now(),
        start,
        end,
        type: 'Ticket',
        status: 'pending',
        title: `Ticket: ${ticket?.title ?? 'Activity'}`,
        ticket,
        allDay: false,
      },
    ]);
    setShowTicketActivityDialog(false);
    // Optionally clear slot after creation:
    setPendingSlot(null);
  };

  return (
    <div className="bg-[#FFF8E9] min-h-screen p-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Calendar</h2>
        <p className="text-gray-500 mt-2">
          Click empty timeslot to schedule an activity - an availability (inspection or open house) or maintenance (to be added in Milestone 3).
        </p>
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
                slot.status === 'booked' ? '#e5e7eb'
                : slot.status === 'pending' ? '#F2F2F2'
                : slot.type === 'Open House' ? '#DCFFCD'
                : '#CEF4F1',
              textColor:
                slot.status === 'booked' ? '#6b7280'
                : slot.status === 'pending' ? '#000000'
                : slot.type === 'Open House' ? '#68A44F'
                : '#24A89E',
              borderColor:
                slot.status === 'booked' ? '#9ca3af'
                : slot.status === 'pending' ? '#000000'
                : slot.type === 'Open House' ? '#A98A22'
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
          headerToolbar={{ left: 'prev today next', center: '', right: 'title' }}
          buttonText={{ today: 'Today' }}
          titleFormat={{ year: 'numeric', month: 'long' }}
          height="auto"
        />

        {/* Existing dialogs */}
        <ConfirmDialog isOpen={showDialog} onConfirm={handleConfirm} onCancel={closeDialogs} />
        <ClearDialog isOpen={showClearDialog} onConfirm={handleClearConfirm} onCancel={closeDialogs} />
        <AvailabilityTypeDialog
          isOpen={showAvailabilityTypeDialog}
          pendingSlot={pendingSlot}
          onSelect={handleAvailabilityTypeSelect}
          onClose={closeDialogs}
        />
        <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />

        {/* Choose activity type (Availability vs Ticket) */}
        <ActivityTypeDialog
          isOpen={showActivityTypeDialog}
          onSelect={handleActivityTypeSelect}
          onClose={closeDialogs}
        />

        {/* Ticket picker — DO NOT use closeDialogs here or you'll lose pendingSlot */}
        <TicketTypeDialog
          isOpen={showTicketTypeDialog}
          onClose={closeTicketPicker}          // 👈 keep slot
          onSelect={handleTicketChosen}        // 👈 opens next dialog with slot
        />

        {/* Ticket activity — receives the SAME slot selected on the calendar */}
        <TicketActivityDialog
          isOpen={showTicketActivityDialog}
          ticket={selectedTicketForActivity}
          pendingSlot={pendingSlot}            // 👈 pass the slot here
          onCreate={handleCreateTicketActivity}
          onChangeTicket={() => {
            setShowTicketActivityDialog(false);
            setShowTicketTypeDialog(true);     // allow re-pick; still keeping slot
          }}
          onClose={() => setShowTicketActivityDialog(false)} // keep slot if they just close
        />
      </div>

      <div className="flex justify-between max-w-6xl mx-auto mt-6">
        <button
          onClick={handleConfirmButtonClick}
          disabled={newEvents.length === 0}
          className={`font-bold py-3 px-6 rounded-md ${
            newEvents.length === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-[#9747FF] hover:bg-purple-200 text-white'
          }`}
        >
          Confirm
        </button>
        <button
          onClick={handleClearButtonClick}
          className="bg-red-500 hover:bg-red-400 text-white font-bold py-3 px-6 rounded-md"
        >
          Clear
        </button>
      </div>
    </div>
  );
};
