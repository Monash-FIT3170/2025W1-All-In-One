import React, { useState , useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { AgentAvailabilities, OpenHouseAttendance, TicketActivities } from '../../../api/database/collections';
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

  // Ticket flow state
  const [showTicketTypeDialog, setShowTicketTypeDialog] = useState(false);
  const [showTicketActivityDialog, setShowTicketActivityDialog] = useState(false);
  const [selectedTicketForActivity, setSelectedTicketForActivity] = useState(null);

  const [pendingSlot, setPendingSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editEvent, setEditEvent] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

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

  const { availabilities, isLoading } = useTracker(() => {
    const handler = Meteor.subscribe('agentAvailabilities');
    const data = AgentAvailabilities.find().fetch();
    return {
      availabilities: data,
      isLoading: !handler.ready(),
    };
  });

  const { ticketActivities, loadingTickets } = useTracker(() => {
    const handler = Meteor.subscribe('ticketActivities');
    const data = TicketActivities.find().fetch();
    return {
      ticketActivities: data,
      loadingTickets: !handler.ready(),
    };
  });

  // Calendar slot selection
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
    const { address, price, bedrooms, bathrooms, parking, image, is_private } = propertyInfo;

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
      is_private,
    });
  };

  const handleBookingSelect = async ({
    type, start, end, address, price, bedrooms, bathrooms,
    parking, image, note, is_private,
  }) => {
    const status = type === 'Open House' && is_private ? 'Invitation sent' : 'confirmed';
    const tempEvent = {
      id: Date.now(),
      start,
      end,
      type,
      status,
      title: `Pending: ${type} Availability`,
      property: { address, price, bedrooms, bathrooms, parking, image, is_private },
      price, bedrooms, bathrooms, parking, image, note,
      allDay: false,
      is_private,
    };

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
        status,
        String(note ?? ''),
        is_private ?? false
      );

      if (type === 'Open House' && !is_private) {
        const curr_booking = AgentAvailabilities.findOne({ start: start.toISOString() });
        const booking_id = curr_booking?._id;
        if (booking_id) {
          await callAsync('openHouseAttendance.insert',
            booking_id, address,
            start.toISOString(), end.toISOString(), []
          );
        }
      }
    } catch (error) {
      alert('Insert failed: ' + error.reason);
      console.error('Failed to create availability:', error.reason);
      return;
    }

    setPendingSlot(null);
    setShowOpenHouseDialog(false);
  };

  const handleClearButtonClick = () => setShowClearDialog(true);

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

  const handleEventClick = (info) => {
    if (!info.event.id || (info.event.id.length !== 17 && info.event.id.length !== 24)) {
      alert('You can only edit saved availabilities.');
      return;
    }

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

    setEditEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      ...info.event.extendedProps,
    });
    setShowEditDialog(true);
  };

  // Ticket handlers
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
        ticket?.ticket_id || ticket?._id || '',
        Meteor.userId(),
        ticket?.title ?? 'Activity',
        notes ?? ''
      );
    } catch (err) {
      alert('Insert failed: ' + err.reason);
      console.error('Failed to create ticket activity:', err);
    }
    setShowTicketActivityDialog(false);
    setPendingSlot(null);
  };

  return (
    <div className="bg-[#FFF8E9] min-h-screen p-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Calendar</h2>
        <p className="text-gray-500 mt-2">
          Click empty timeslot to schedule an activity - an availability
          (inspection or open house) or maintenance (to be added in Milestone 3).
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
            ...ticketActivities.map(act => ({
              id: act._id,
              title: `Ticket: ${act.title}`,
              start: new Date(act.start),
              end: new Date(act.end),
              backgroundColor: '#FFE4E6',
              textColor: '#B91C1C',
              borderColor: '#FCA5A5',
              extendedProps: act,
            })),
            ...newEvents.map(event => ({
              ...event,
              backgroundColor: '#F2F2F2',
              textColor: '#000000',
              borderColor: '#000000',
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
      {/* Edit dialog left as-is */}
    </div>
  );
};
