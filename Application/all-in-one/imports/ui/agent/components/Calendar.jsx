import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';

// ✅ All collections
import { 
  AgentAvailabilities, 
  OpenHouseAttendance, 
  TicketActivities 
} from '../../../api/database/collections';

import { ClearDialog } from './ClearDialog.jsx'; 
import { AvailabilityTypeDialog } from './AvailabilityTypeDialog.jsx'; 
import { ActivityTypeDialog } from './ActivityTypeDialog.jsx'; 
import { EventDetailModal } from './EventDetailModal.jsx';
import { TicketTypeDialog } from './TicketTypeDialog.jsx';
import { TicketActivityDialog } from './TicketActivityDialog.jsx';

const callAsync = (methodName, ...args) => {
  return new Promise((resolve, reject) => {
    Meteor.call(methodName, ...args, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
};

export const Calendar = () => {
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showAvailabilityTypeDialog, setShowAvailabilityTypeDialog] = useState(false);
  const [showOpenHouseDialog, setShowOpenHouseDialog] = useState(false);
  const [showActivityTypeDialog, setShowActivityTypeDialog] = useState(false);

  // 👇 ticket flow state
  const [showTicketTypeDialog, setShowTicketTypeDialog] = useState(false);
  const [showTicketActivityDialog, setShowTicketActivityDialog] = useState(false);
  const [selectedTicketForActivity, setSelectedTicketForActivity] = useState(null);

  const [pendingSlot, setPendingSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const closeDialogs = () => {
    setShowClearDialog(false);
    setShowActivityTypeDialog(false);
    setShowAvailabilityTypeDialog(false);
    setShowTicketTypeDialog(false);
    setShowOpenHouseDialog(false);
    setShowTicketActivityDialog(false);
    setPendingSlot(null);
    setSelectedEvent(null);
    setSelectedTicketForActivity(null);
  };

  const closeTicketPicker = () => setShowTicketTypeDialog(false);

  // === Subscriptions ===
  const { availabilities } = useTracker(() => {
    const handler = Meteor.subscribe('agentAvailabilities');
    return {
      availabilities: AgentAvailabilities.find().fetch(),
      isLoading: !handler.ready(),
    };
  });

  const { ticketActivities } = useTracker(() => {
    const handler = Meteor.subscribe('ticketActivities');
    return {
      ticketActivities: TicketActivities.find().fetch(),
      isLoading: !handler.ready(),
    };
  });

  // === Handlers ===
  const handleSelect = (info) => {
    setPendingSlot({ start: info.start, end: info.end });
    setShowActivityTypeDialog(true);
  };

  const handleActivityTypeSelect = (activity_type) => {
    setShowActivityTypeDialog(false);
    if (activity_type === 'Availability') {
      setShowAvailabilityTypeDialog(true);
    } else if (activity_type === 'Ticket') {
      setShowTicketTypeDialog(true);
    }
  };

  const handleAvailabilityTypeSelect = (type, start, end, propertyInfo, note) => {
    setShowAvailabilityTypeDialog(false);
    handleBookingSelect({ type, start, end, ...propertyInfo, note });
  };

  // === INSERT availability immediately into DB ===
  const handleBookingSelect = async ({
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
    is_private,
  }) => {
    const status = type === 'Open House' && is_private ? 'Invitation sent' : 'confirmed';

    try {
      const insertedId = await callAsync(
        'agentAvailabilities.insert',
        start.toISOString(),
        end.toISOString(),
        'Availability',
        type,
        { address, price, bedrooms, bathrooms, parking, image, is_private },
        String(price ?? ''),
        String(bedrooms ?? ''),
        String(bathrooms ?? ''),
        String(parking ?? ''),
        String(image ?? ''),
        status,
        String(note ?? ''),
        is_private ?? false
      );

      if (type === 'Open House' && !is_private) {
        await callAsync(
          'openHouseAttendance.insert',
          insertedId,
          address,
          start.toISOString(),
          end.toISOString(),
          []
        );
      }
    } catch (error) {
      alert('Insert failed: ' + error.reason);
      console.error(error);
      return;
    }

    setPendingSlot(null);
    setShowOpenHouseDialog(false);
  };

  const handleClearButtonClick = () => setShowClearDialog(true);

  // const handleClearConfirm = () => {
  //   Meteor.call('agentAvailabilities.clear', (error) => {
  //     if (error) {
  //       console.error(error);
  //     } else {
  //       setShowClearDialog(false);
  //     }
  //   });
  // };
  const handleClearConfirm = () => {
  Meteor.call('calendar.clearAll', (error) => {
    if (error) {
      console.error(error);
    } else {
      setShowClearDialog(false);
    }
    });
  };


  const handleEventClick = (info) => {
    // ✅ Only show booked event details
    //if (info.event.extendedProps.status === 'booked') {
      setSelectedEvent({
        id: info.event.id,
        title: info.event.title,
        start: info.event.start,
        end: info.event.end,
        ...info.event.extendedProps,
      });
    //}
  };

  // === Ticket flow ===
  const handleTicketChosen = (ticket) => {
    setSelectedTicketForActivity(ticket);
    setShowTicketTypeDialog(false);
    setShowTicketActivityDialog(true);
  };

  const handleCreateTicketActivity = async ({ start, end, notes, ticket }) => {
    try {
      await callAsync(
        'ticketActivities.insert',
        start.toISOString(),
        end.toISOString(),
        String(ticket?._id || ticket?.ticket_id || ''),
        Meteor.userId() || '',
        ticket?.title || 'Activity',
        String(notes || ''),
        'pending'
      );
    } catch (err) {
      alert('Failed to save ticket activity: ' + (err.reason || err.message));
      console.error(err);
      return;
    }

    setShowTicketActivityDialog(false);
    setPendingSlot(null);
  };

  // === Render ===
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
        <style>{`
          .fc .invite-pending {
            border-style: dashed !important;
            border-width: 2px !important;
          }
        `}</style>

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
            // Availabilities
            ...availabilities.map(slot => {
              const type = slot.availability_type || slot.type;
              const statusLower = String(slot.status || '').toLowerCase();

              const isBooked = statusLower === 'booked';
              const isPrivateInvite =
                type === 'Open House' &&
                slot.is_private === true &&
                /^(invitation sent|invite sent|invited)$/.test(statusLower);

              let title, backgroundColor, textColor, borderColor, classNames = [];

              if (isBooked) {
                title = 'Booked';
                backgroundColor = '#e5e7eb'; textColor = '#6b7280'; borderColor = '#9ca3af';
              } else if (isPrivateInvite) {
                title = 'Private Open House (Invite Sent)';
                backgroundColor = '#e5e7eb'; textColor = '#374151'; borderColor = '#9ca3af';
                classNames = ['invite-pending'];
              } else if (slot.status === 'pending') {
                title = `Pending: ${type} Availability`;
                backgroundColor = '#F2F2F2'; textColor = '#000000'; borderColor = '#000000';
              } else if (type === 'Open House') {
                title = 'Open House Availability';
                backgroundColor = '#DCFFCD'; textColor = '#68A44F'; borderColor = '#A98A22';
              } else {
                title = 'Inspection Availability';
                backgroundColor = '#CEF4F1'; textColor = '#24A89E'; borderColor = '#24A89E';
              }

              return { ...slot, id: slot._id, title, backgroundColor, textColor, borderColor, classNames };
            }),
            // Ticket Activities
            ...ticketActivities.map(act => ({
              ...act,
              id: act._id,
              start: new Date(act.start),
              end: new Date(act.end),
              title: act.title || 'Ticket Activity',
              backgroundColor: '#FFE6CC',
              textColor: '#000000',
              borderColor: '#FF9900',
            })),
          ]}
          eventClick={handleEventClick}
          headerToolbar={{ left: 'prev today next', center: '', right: 'title' }}
          buttonText={{ today: 'Today' }}
          titleFormat={{ year: 'numeric', month: 'long' }}
          height="auto"
        />

        <ClearDialog isOpen={showClearDialog} onConfirm={handleClearConfirm} onCancel={closeDialogs} />
        <ActivityTypeDialog isOpen={showActivityTypeDialog} onSelect={handleActivityTypeSelect} onClose={closeDialogs} />
        <AvailabilityTypeDialog isOpen={showAvailabilityTypeDialog} pendingSlot={pendingSlot} onSelect={handleAvailabilityTypeSelect} onClose={closeDialogs} />
        <TicketTypeDialog isOpen={showTicketTypeDialog} onClose={closeTicketPicker} onSelect={handleTicketChosen} />
        <TicketActivityDialog
          isOpen={showTicketActivityDialog}
          ticket={selectedTicketForActivity}
          pendingSlot={pendingSlot}
          onCreate={handleCreateTicketActivity}
          onChangeTicket={() => { setShowTicketActivityDialog(false); setShowTicketTypeDialog(true); }}
          onClose={() => setShowTicketActivityDialog(false)}
        />
      </div>

      {selectedEvent && <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}

      <div className="flex justify-between max-w-6xl mx-auto mt-6">
        <button onClick={handleClearButtonClick} className="bg-red-500 hover:bg-red-400 text-white font-bold py-3 px-6 rounded-md">
          Clear
        </button>
      </div>
    </div>
  );
};
