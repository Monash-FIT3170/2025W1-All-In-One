/**
 * Calendar Component (Delete fix — robust kind detection)
 *
 * What changed:
 * - 🩹 FIX: Robust `kind` detection in eventClick (even if tag missing)
 * - 🩹 FIX: Always carry `kind` and `sourceId` into selectedEvent
 * - 🩹 FIX: Central delete handler branches on kind
 *
 * Also keeps ticket→property hydration from earlier.
 */
import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";

import {
  AgentAvailabilities,
  OpenHouseAttendance,
  TicketActivities,
  Tickets,
  Properties,
} from "../../../api/database/collections";

import { ClearDialog } from "./ClearDialog.jsx";
import { AvailabilityTypeDialog } from "./AvailabilityTypeDialog.jsx";
import { ActivityTypeDialog } from "./ActivityTypeDialog.jsx";
import { EventDetailModal } from "./EventDetailModal.jsx";
import { TicketTypeDialog } from "./TicketTypeDialog.jsx";
import { TicketActivityDialog } from "./TicketActivityDialog.jsx";

const callAsync = (methodName, ...args) =>
  new Promise((resolve, reject) => {
    Meteor.call(methodName, ...args, (err, res) =>
      err ? reject(err) : resolve(res)
    );
  });

function toDatetimeLocal(date) {
  if (!date) return "";
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

// 🩹 FIX: helper to robustly detect event kind
const detectKind = (props) => {
  if (!props) return "availability";
  if (props.kind) return props.kind; // trust explicit tag when present
  // infer from common fields
  if (props.ticket_id || props.ticket) return "ticketActivity";
  return "availability";
};

export const Calendar = () => {
  const [newEvents, setNewEvents] = useState([]);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showAvailabilityTypeDialog, setShowAvailabilityTypeDialog] =
    useState(false);
  const [showOpenHouseDialog, setShowOpenHouseDialog] = useState(false);
  const [showActivityTypeDialog, setShowActivityTypeDialog] = useState(false);

  // ticket flow state
  const [showTicketTypeDialog, setShowTicketTypeDialog] = useState(false);
  const [showTicketActivityDialog, setShowTicketActivityDialog] =
    useState(false);
  const [selectedTicketForActivity, setSelectedTicketForActivity] =
    useState(null);

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

  const { availabilities } = useTracker(() => {
    const h1 = Meteor.subscribe("agentAvailabilities");
    Meteor.subscribe("openHouseAttendance");
    return {
      availabilities: AgentAvailabilities.find().fetch(),
      isLoading: !h1.ready(),
    };
  });

  const { ticketActivities } = useTracker(() => {
    const h = Meteor.subscribe("ticketActivities");
    return {
      ticketActivities: TicketActivities.find().fetch(),
      isLoading: !h.ready(),
    };
  });

  const { ticketsById, propertiesByPropId } = useTracker(() => {
    const tSub = Meteor.subscribe("tickets");
    const pSub = Meteor.subscribe("properties");

    const tickets = Tickets.find().fetch();
    const props = Properties.find().fetch();

    const tMap = new Map();
    tickets.forEach((t) => {
      const key = t._id || t.ticket_id;
      if (key) tMap.set(String(key), t);
      if (t.ticket_id && !tMap.has(String(t.ticket_id)))
        tMap.set(String(t.ticket_id), t);
    });

    const pMap = new Map();
    props.forEach((p) => {
      if (p.prop_id) pMap.set(String(p.prop_id), p);
    });

    return {
      ticketsById: tMap,
      propertiesByPropId: pMap,
      isLoading: !tSub.ready() || !pSub.ready(),
    };
  });

  const handleSelect = (info) => {
    setPendingSlot({ start: info.start, end: info.end });
    setShowActivityTypeDialog(true);
  };

  const handleActivityTypeSelect = (activity_type) => {
    setShowActivityTypeDialog(false);
    if (activity_type === "Availability") setShowAvailabilityTypeDialog(true);
    else if (activity_type === "Ticket") setShowTicketTypeDialog(true);
  };

  const handleAvailabilityTypeSelect = (
    type,
    start,
    end,
    propertyInfo,
    note,
    eoi
  ) => {
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
    eoi,
  }) => {
    const status =
      type === "Open House" && is_private ? "Invitation sent" : "confirmed";

    try {
      const currentUserId = Meteor.userId();
      const insertedId = await callAsync(
        "agentAvailabilities.insert",
        start.toISOString(),
        end.toISOString(),
        "Availability",
        type,
        { address, price, bedrooms, bathrooms, parking, image, is_private },
        String(price ?? ""),
        String(bedrooms ?? ""),
        String(bathrooms ?? ""),
        String(parking ?? ""),
        String(image ?? ""),
        status,
        String(note ?? ""),
        is_private ?? false,
        currentUserId
      );

      if (type === "Open House" && !is_private) {
        await callAsync(
          "openHouseAttendance.insert",
          insertedId,
          address,
          start.toISOString(),
          end.toISOString(),
          []
        );
      }

      if (type === "Open House" && is_private && eoi != null) {
        const curr_booking = AgentAvailabilities.findOne({
          start: start.toISOString(),
        });
        const booking_id = curr_booking?._id;
        Meteor.call(
          "expressionOfInterest.sendInvite",
          eoi,
          booking_id,
          (err) => {
            if (err) console.error("EOI invite send failed: ", err);
          }
        );
      }
    } catch (error) {
      alert("Insert failed: " + (error.reason || error.message));
      console.error("Failed to create availability:", error);
      return;
    }

    setPendingSlot(null);
    setShowOpenHouseDialog(false);
  };

  const handleClearButtonClick = () => setShowClearDialog(true);

  const handleClearConfirm = () => {
    Meteor.call("calendar.clearAll", (error) => {
      if (error) {
        console.error("Failed to clear calendar: " + error.reason);
      } else {
        setNewEvents([]);
        setShowClearDialog(false);
      }
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
        "ticketActivities.insert",
        start.toISOString(),
        end.toISOString(),
        String(ticket?._id || ticket?.ticket_id || ""),
        Meteor.userId() || "",
        ticket?.title || "Activity",
        String(notes || ""),
        "pending"
      );
    } catch (err) {
      alert("Failed to save ticket activity: " + (err.reason || err.message));
      console.error(err);
      return;
    }

    setShowTicketActivityDialog(false);
    setPendingSlot(null);
  };

  const toPropertyPayload = (propDoc) => {
    if (!propDoc) return null;
    // Prefer Cloudinary-style image URLs from propDoc.photo
    let firstPhotoUrl = undefined;
    if (Array.isArray(propDoc.photo)) {
      const firstNonVideoPhoto = propDoc.photo.find((item) => {
        if (typeof item === "string") return item.trim().length > 0;
        if (item && typeof item === "object") {
          const isNotVideo =
            item.isVideo === false || item.isVideo === undefined;
          const isNotPdf = item.isPDF === false || item.isPDF === undefined;
          return Boolean(item.url) && isNotVideo && isNotPdf;
        }
        return false;
      });
      if (typeof firstNonVideoPhoto === "string")
        firstPhotoUrl = firstNonVideoPhoto;
      else if (firstNonVideoPhoto && typeof firstNonVideoPhoto === "object")
        firstPhotoUrl = firstNonVideoPhoto.url;
    }
    return {
      address: propDoc.prop_address,
      price: propDoc.prop_pricepweek,
      bedrooms: propDoc.prop_numbeds,
      bathrooms: propDoc.prop_numbaths,
      parking: propDoc.prop_numcarspots,
      type: propDoc.prop_type,
      image: firstPhotoUrl,
      prop_id: propDoc.prop_id,
    };
  };

  // 🩹 FIX: central delete that routes by event kind (never calls wrong method)
  const handleDeleteEvent = async (evt) => {
    try {
      const kind = detectKind(evt);
      if (kind === "ticketActivity") {
        await callAsync("ticketActivities.remove", evt.sourceId || evt.id);
      } else {
        await callAsync("agentAvailabilities.remove", evt.sourceId || evt.id);
        // optional: await callAsync('openHouseAttendance.removeByBooking', evt.sourceId || evt.id);
      }
      setSelectedEvent(null);
    } catch (err) {
      alert(`Failed to delete: ${err.reason || err.message}`);
      console.error(err);
    }
  };

  //Click handler for when the tenants selects a slot to book
  const handleTenantSelect = async (info) => {
    if (confirm(`Book inspection on ${info.startStr}?`)) {
      await Meteor.callAsync(
        "inspections.requestSlot",
        info.event.id,
        Meteor.userId()
      );
      alert("Inspection request sent to agent.");
    }
  };

  const availableEvents = availabilities
    .filter((a) => a.status === "free")
    .map((a) => ({
      id: a._id,
      start: a.start,
      end: a.end,
      title: "Available Inspection",
      backgroundColor: "#D1FAE5",
    }));

  return (
    <div className="bg-[#FFF8E9] min-h-screen p-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Calendar</h2>
        <p className="text-gray-500 mt-2">
          Click empty timeslot to schedule an activity - an availability
          (inspection or open house) or ticket activity.
        </p>
      </div>

      <div className="border-t border-gray-300 max-w-6xl mx-auto mb-6"></div>

      <div className="bg-white p-4 rounded-lg shadow-lg max-w-6xl mx-auto">
        <style>{`.fc .invite-pending { border-style: dashed !important; border-width: 2px !important; }`}</style>

        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          slotMinTime="07:00:00"
          slotMaxTime="18:00:00"
          scrollTime="07:00:00"
          allDaySlot={false}
          selectable
          select={handleSelect}
          events={[
            // Availabilities
            ...availabilities.map((slot) => {
              const type = slot.availability_type || slot.type;
              const statusLower = String(slot.status || "").toLowerCase();
              const isBooked = statusLower === "booked";
              const isPrivateInvite =
                type === "Open House" &&
                slot.is_private === true &&
                /^(invitation sent|invite sent|invited)$/.test(statusLower);

              let title,
                backgroundColor,
                textColor,
                borderColor,
                classNames = [];

              if (isBooked) {
                title = "Booked";
                backgroundColor = "#e5e7eb";
                textColor = "#6b7280";
                borderColor = "#9ca3af";
              } else if (isPrivateInvite) {
                title = "Private Open House (Invite Sent)";
                backgroundColor = "#e5e7eb";
                textColor = "#374151";
                borderColor = "#9ca3af";
                classNames = ["invite-pending"];
              } else if (slot.status === "pending") {
                title = `Pending: ${type} Availability`;
                backgroundColor = "#F2F2F2";
                textColor = "#000000";
                borderColor = "#000000";
              } else if (slot.status === "rejected") {
                title = "Private Open House (Invite Rejected)";
                backgroundColor = "#888888";
                textColor = "#353535";
                borderColor = "#ff0000";
              } else if (type === "Open House") {
                title = "Open House Availability";
                backgroundColor = "#DCFFCD";
                textColor = "#68A44F";
                borderColor = "#A98A22";
              } else {
                title = "Inspection Availability";
                backgroundColor = "#CEF4F1";
                textColor = "#24A89E";
                borderColor = "#24A89E";
              }

              return {
                ...slot,
                id: slot._id,
                // (we still add these; but the fix does not rely on them)
                kind: "availability",
                sourceId: slot._id,
                title,
                backgroundColor,
                textColor,
                borderColor,
                classNames,
              };
            }),

            // Ticket Activities (enriched)
            ...ticketActivities.map((act) => {
              const ticketDoc =
                ticketsById.get(String(act.ticket_id)) ||
                ticketsById.get(
                  String(act.ticket?._id || act.ticket?.ticket_id)
                ) ||
                null;

              const propDoc = ticketDoc
                ? propertiesByPropId.get(String(ticketDoc.prop_id))
                : null;

              return {
                ...act,
                id: act._id,
                kind: "ticketActivity", // tag if present
                sourceId: act._id,
                start: new Date(act.start),
                end: new Date(act.end),
                title: act.title || ticketDoc?.title || "Ticket Activity",
                backgroundColor: "#FFE6CC",
                textColor: "#000000",
                borderColor: "#FF9900",
                ticket: ticketDoc || undefined,
                property: toPropertyPayload(propDoc) || undefined,
              };
            }),

            ...newEvents.map((event) => ({
              ...event,
              backgroundColor: "#F2F2F2",
              textColor: "#000000",
              borderColor: "#000000",
            })),
          ]}
          eventClick={(info) => {
            const props = info.event.extendedProps;

            // 🩹 FIX: robustly determine kind + safe sourceId
            const kind = detectKind(props);
            const sourceId = props?.sourceId || info.event.id;

            // Base selected event
            const base = {
              id: info.event.id,
              title: info.event.title,
              start: info.event.start,
              end: info.event.end,
              kind, // 🩹 FIX: store the resolved kind
              sourceId, // 🩹 FIX: store the resolved source id
              ...props,
            };

            // Open house: pull attendance
            if (
              props.type === "Open House" ||
              props.availability_type === "Open House"
            ) {
              Meteor.subscribe("openHouseAttendance");
              const attendanceRecord = OpenHouseAttendance.findOne({
                bookingID: base.id,
              });
              setSelectedEvent({
                ...base,
                attendanceList: attendanceRecord?.attendanceList || [],
              });
              return;
            }

            // Ticket fallback hydration (no-op if already present)
            let hydrated = { ...base };
            if (
              !hydrated.property &&
              (hydrated.ticket_id ||
                hydrated.ticket?.ticket_id ||
                hydrated.ticket?._id)
            ) {
              const t =
                ticketsById.get(String(hydrated.ticket_id)) ||
                ticketsById.get(String(hydrated.ticket?._id)) ||
                ticketsById.get(String(hydrated.ticket?.ticket_id));
              const p = t ? propertiesByPropId.get(String(t.prop_id)) : null;
              hydrated.ticket = hydrated.ticket || t || undefined;
              hydrated.property = toPropertyPayload(p) || undefined;
            }

            setSelectedEvent(hydrated);
          }}
          headerToolbar={{
            left: "prev today next",
            center: "",
            right: "title",
          }}
          buttonText={{ today: "Today" }}
          titleFormat={{ year: "numeric", month: "long" }}
          height="auto"
        />

        <ClearDialog
          isOpen={showClearDialog}
          onConfirm={handleClearConfirm}
          onCancel={closeDialogs}
        />
        <ActivityTypeDialog
          isOpen={showActivityTypeDialog}
          onSelect={handleActivityTypeSelect}
          onClose={closeDialogs}
        />
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

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          // 🩹 FIX: delete uses robust kind/sourceId from selectedEvent
          onDelete={() => handleDeleteEvent(selectedEvent)}
          onAttendanceUpdate={() => {
            if (
              selectedEvent.type === "Open House" ||
              selectedEvent.availability_type === "Open House"
            ) {
              const attendanceRecord = OpenHouseAttendance.findOne({
                bookingID: selectedEvent.id,
              });
              setSelectedEvent((prev) => ({
                ...prev,
                attendanceList: attendanceRecord?.attendanceList || [],
              }));
            }
          }}
        />
      )}

      <div className="flex justify-between max-w-6xl mx-auto mt-6">
        <button
          onClick={handleClearButtonClick}
          className="bg-red-500 hover:bg-red-400 text-white font-bold py-3 px-6 rounded-md"
        >
          Clear All
        </button>
        <p className="text-sm text-gray-800 mb-4">
          Clears all availabilities and ticket activities from the calendar.
        </p>
      </div>
    </div>
  );
};
