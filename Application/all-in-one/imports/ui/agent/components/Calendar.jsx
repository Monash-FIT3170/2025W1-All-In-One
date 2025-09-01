/**
 * Calendar Component
 *
 * A comprehensive calendar interface for agents to manage their schedule and activities.
 * Features:
 * - Interactive calendar view with time grid display
 * - Create availability slots for inspections and open houses
 * - Schedule and manage various activities (inspections, open houses, meetings)
 * - View and manage open house attendance
 * - Real-time data synchronization with MongoDB collections
 * - Multiple dialog modals for different activity types
 */
import React, { useState , useEffect } from 'react';
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

/**
 * Utility function to call Meteor methods asynchronously
 *
 * @param {string} methodName - Name of the Meteor method to call
 * @param {...any} args - Arguments to pass to the method
 * @returns {Promise} Promise that resolves with the method result or rejects with error
 */
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
  // State management for various dialogs and events
  const [newEvents, setNewEvents] = useState([]);
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

  /**
   * Closes all dialogs and resets related state
   */
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

  /**
   * Fetches agent availabilities using Meteor subscription
   *
   * @type {Object} Object containing availabilities data and loading state
   */
  const closeTicketPicker = () => setShowTicketTypeDialog(false);

  const { availabilities, isLoading } = useTracker(() => {
    const handler = Meteor.subscribe('agentAvailabilities');
    const attendanceHandler = Meteor.subscribe('openHouseAttendance');
    const data = AgentAvailabilities.find().fetch();
    return {
      availabilities: data,
      isLoading: !handler.ready() || !attendanceHandler.ready(),
    };
  });

  const { ticketActivities } = useTracker(() => {
    const handler = Meteor.subscribe('ticketActivities');
    return {
      ticketActivities: TicketActivities.find().fetch(),
      isLoading: !handler.ready(),
    };
  });

  /**
   * Handles calendar slot selection to schedule new activities
   *
   * @param {Object} info - Calendar selection information
   */
  const handleSelect = (info) => {
    setPendingSlot({ start: info.start, end: info.end });
    setShowActivityTypeDialog(true);
  };

  /**
   * Handles activity type selection from dialog
   *
   * @param {string} activity_type - Type of activity selected
   */
  const handleActivityTypeSelect = (activity_type) => {
    setShowActivityTypeDialog(false);
    if (activity_type === 'Availability') {
      setShowAvailabilityTypeDialog(true);
    } else if (activity_type === 'Ticket') {
      setShowTicketTypeDialog(true);
    }
  };

  const handleAvailabilityTypeSelect = (type, start, end, propertyInfo, note, eoi) => {
    setShowAvailabilityTypeDialog(false);
    handleBookingSelect({ type, start, end, ...propertyInfo, note, eoi });
  };

  const handleBookingSelect = async ({
    type,
    start,
    end,
    id,
    agent_id,
    address,
    price,
    bedrooms,
    bathrooms,
    parking,
    image,
    note,
    is_private,
    eoi
  }) => {
    const status = type === 'Open House' && is_private ? 'Invitation sent' : 'confirmed';

    // Immediately insert into DB
    try {
      const currentUserId = Meteor.userId();
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
        is_private ?? false,
        currentUserId
      );

      // Creates an attendance list for any new open house availabilities
      if (type === 'Open House' && !is_private){
        const curr_booking = AgentAvailabilities.findOne({
          start: start.toISOString() });

        const booking_id = curr_booking._id;
        const attendanceList = [];

        await callAsync(
          'openHouseAttendance.insert',
          insertedId,
          address,
          start.toISOString(),
          end.toISOString(),
          attendanceList
        );
      }
      if (type === 'Open House' && is_private && eoi != null) {
        const curr_booking = AgentAvailabilities.findOne({ start: start.toISOString() });
        const booking_id = curr_booking?._id;
        Meteor.call('expressionOfInterest.sendInvite', eoi, booking_id, (err) => {
          if (err) console.error('EOI invite send failed: ', err);
        });
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


  /**
   * Handles clearing all availabilities from the database
   */
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
    setSelectedEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      ...info.event.extendedProps,
    });
  };

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

  return (
    <div className="bg-[#FFF8E9] min-h-screen p-8">
      {/* Calendar header and description */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Calendar</h2>
        <p className="text-gray-500 mt-2">
          Click empty timeslot to schedule an activity - an availability (inspection or open house) or ticket activity.
        </p>
      </div>

      {/* Visual separator */}
      <div className="border-t border-gray-300 max-w-6xl mx-auto mb-6"></div>

      {/* Main calendar container */}
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
              } else if (slot.status === 'rejected') {
                title = 'Private Open House (Invite Rejected)';
                backgroundColor = '#888888'; textColor = '#353535'; borderColor = '#ff0000';
              } else if (type === 'Open House') {
                title = 'Open House Availability';
                backgroundColor = '#DCFFCD'; textColor = '#68A44F'; borderColor = '#A98A22';
              } else {
                title = 'Inspection Availability';
                backgroundColor = '#CEF4F1'; textColor = '#24A89E'; borderColor = '#24A89E';
              }

              return {
                ...slot,
                id: slot._id,
                title,
                backgroundColor,
                textColor,
                borderColor,
                classNames,
              };
            }),
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
            // Map new events to calendar events
            ...newEvents.map(event => ({
              ...event,
              backgroundColor: '#F2F2F2',
              textColor: '#000000',
              borderColor: '#000000',
            })),
          ]}                   
          eventClick={(info) => {
            const clicked = info.event.extendedProps;

            // If this is an Open House event, fetch the attendance list
            if (clicked.type === 'Open House') {
              // Subscribe to open house attendance data
              Meteor.subscribe('openHouseAttendance');

              // Find the attendance record for this event
              const attendanceRecord = OpenHouseAttendance.findOne({
                bookingID: info.event.id
              });

              setSelectedEvent({
                id: info.event.id, // Include the MongoDB _id
                title: info.event.title,
                start: info.event.start,
                end: info.event.end,
                attendanceList: attendanceRecord?.attendanceList || [],
                ...clicked,
              });
            } else {
              setSelectedEvent({
                id: info.event.id, // Include the MongoDB _id
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

        <ClearDialog isOpen={showClearDialog} onConfirm={handleClearConfirm} onCancel={closeDialogs} />
        <ActivityTypeDialog isOpen={showActivityTypeDialog} onSelect={handleActivityTypeSelect} onClose={closeDialogs} />
        <AvailabilityTypeDialog 
          isOpen={showAvailabilityTypeDialog} 
          pendingSlot={pendingSlot}
          onSelect={handleAvailabilityTypeSelect}
          onClose={closeDialogs} 
        />
        <TicketTypeDialog
          isOpen={showTicketTypeDialog}
          onClose={closeTicketPicker}
          onSelect={handleTicketChosen}
        />
        <TicketActivityDialog
          isOpen={showTicketActivityDialog}
          ticket={selectedTicketForActivity}
          pendingSlot={pendingSlot}
          onCreate={handleCreateTicketActivity}
          onChangeTicket={() => {
            setShowTicketActivityDialog(false);
            setShowTicketTypeDialog(true);
          }}
          onClose={() => setShowTicketActivityDialog(false)}
        />
      </div>

      {/* Show event detail modal for booked events */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onAttendanceUpdate={() => {
            // Refresh the attendance data when attendance is updated
            if (selectedEvent.type === 'Open House') {
              // Force a re-render by updating the selectedEvent with fresh data
              const attendanceRecord = OpenHouseAttendance.findOne({
                bookingID: selectedEvent.id
              });
              setSelectedEvent(prev => ({
                ...prev,
                attendanceList: attendanceRecord?.attendanceList || []
              }));
            }
          }}
        />
      )}

      <div className="flex justify-between max-w-6xl mx-auto mt-6">
        <button onClick={handleClearButtonClick} className="bg-red-500 hover:bg-red-400 text-white font-bold py-3 px-6 rounded-md">
          Clear All
        </button>
        <p className="text-sm text-gray-800 mb-4">
            Booked slots cannot be cleared. You can only clear unbooked availabilities.
        </p>
      </div>
    </div>
  );
};
