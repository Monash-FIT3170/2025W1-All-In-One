import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useTracker } from "meteor/react-meteor-data";
import {
  AgentAvailabilities,
  Properties,
} from "../../../api/database/collections";
import { BookingConfirmDialog } from "./BookingConfirmDialog";
import { Meteor } from "meteor/meteor";

export const InspectionCalendar = ({ propertyId, propertySnapshot }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  const userId = useTracker(() => Meteor.userId());
  const user = useTracker(() => Meteor.user());

  const { availabilities, property, isReady } = useTracker(() => {
    const propertiesHandle = Meteor.subscribe("properties");
    const availabilitiesHandle = Meteor.subscribe("allAvailableInspections");

    const ready = propertiesHandle.ready() && availabilitiesHandle.ready();

    let property = null;
    let availabilities = [];

    if (ready && propertyId) {
      // Get the property to find its agent_id
      property = Properties.findOne({ prop_id: propertyId });

      if (property && property.agent_id) {
        // Only get availabilities from the agent who manages this property
        availabilities = AgentAvailabilities.find({
          activity_type: "Availability",
          type: "Inspection", // exclude open houses
          status: { $ne: "booked" }, // exclude booked
          agent_id: property.agent_id,
        }).fetch();
      }
    }

    return { availabilities, property, isReady: ready };
  }, [propertyId]);

  const handleEventClick = (info) => {
    const availability = info.event.extendedProps;

    // Greyed-out slots (booked/past)
    const isPast = new Date(info.event.start) < new Date();
    if (availability.status === "booked" || isPast) {
      alert("This slot is not available.");
      return;
    }

    setSelectedSlot({
      id: info.event.id,
      start: info.event.start,
      end: info.event.end,
      property: info.event.extendedProps.property, // always an object
    });
    setShowDialog(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedSlot) return;

    const tenantId = Meteor.userId();

    const tenant = {
      id: userId,
      name:
        user?.profile?.name ||
        user?.username ||
        user?.emails?.[0]?.address ||
        "Anonymous",
      email: user?.emails?.[0]?.address || "unknown@email.com",
    };

    // Use the actual property data from props, not from the agent's availability
    const propertyData = property || propertySnapshot;

    const propertyInfo = {
      id: propertyId,
      address: propertyData?.prop_address || "No address available",
      price: propertyData?.prop_pricepweek || null,
      bedrooms: propertyData?.prop_numbeds || null,
      bathrooms: propertyData?.prop_numbaths || null,
      parking: propertyData?.prop_numcarspots || null,
      image: propertyData?.photo?.[0] || "/images/default.jpg",
    };

    const bookingData = {
      agentAvailabilityId: String(selectedSlot.id),
      tenantId,
      tenantName:
        user?.profile?.name ||
        user?.username ||
        user?.emails?.[0]?.address ||
        "Anonymous",
      start: new Date(selectedSlot.start),
      end: new Date(selectedSlot.end),
      property: {
        id: propertyId,
        address: propertyData?.prop_address || "No address available",
        price: propertyData?.prop_pricepweek || null,
        bedrooms: propertyData?.prop_numbeds || null,
        bathrooms: propertyData?.prop_numbaths || null,
        parking: propertyData?.prop_numcarspots || null,
        image: propertyData?.photo?.[0] || "/images/default.jpg",
      },
      status: "booked",
    };

    console.log(
      "bookingData.property keys:",
      Object.keys(bookingData.property)
    );
    console.log("Property data used:", propertyData);

    Meteor.call("tenantBookings.insert", bookingData, (err) => {
      if (err) {
        alert("Booking failed: " + err.reason);
      } else {
        alert("Booking confirmed!");
        setShowDialog(false);
        setSelectedSlot(null);
      }
    });

    // BOOK SLOT USING SERVER METHOD
    Meteor.call(
      "agentAvailabilities.bookSlot",
      selectedSlot.id,
      {
        tenant,
        property: propertyInfo,
      },
      (err) => {
        if (err) {
          alert("Booking failed: " + err.reason);
        } else {
          alert("✅ Booking confirmed! Check your email for confirmation.");
          setShowDialog(false);
          setSelectedSlot(null);
        }
      }
    );
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
          <h2 className="text-3xl font-bold text-gray-800">
            Book Inspection Time
          </h2>
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
          <h2 className="text-3xl font-bold text-gray-800">
            Book Inspection Time
          </h2>
          <p className="text-red-600">Property not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF8E9] min-h-screen p-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Book Inspection Time
        </h2>
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
          events={availabilities.map((slot) => {
            const isPast = new Date(slot.start) < new Date();
            const isBooked = slot.status === "booked";
            const bgColor = isBooked
              ? "#e5e7eb" // booked = grey
              : isPast
              ? "#f5f5f5" // past = lighter grey
              : "#CEF4F1"; // available
            const textColor = isBooked || isPast ? "#9ca3af" : "#24A89E";
            const borderColor = isBooked || isPast ? "#d1d5db" : "#24A89E";

            return {
              id: slot._id,
              start: slot.start,
              end: slot.end,
              title: isBooked
                ? "Booked"
                : isPast
                ? "Unavailable (Past)"
                : "Inspection Availability",
              backgroundColor: bgColor,
              textColor,
              borderColor,
              ...slot,
            };
          })}
          eventClick={handleEventClick}
          headerToolbar={{
            left: "prev today next",
            center: "",
            right: "title",
          }}
          buttonText={{ today: "Today" }}
          titleFormat={{ year: "numeric", month: "long" }}
          height="auto"
        />

        <BookingConfirmDialog
          isOpen={showDialog}
          onConfirm={handleConfirmBooking}
          onCancel={handleCancelBooking}
          bookingData={
            selectedSlot
              ? {
                  ...selectedSlot,
                  tenantEmail: user?.emails?.[0]?.address,
                  agentEmail: property?.agent_email,
                  property: propertySnapshot || property,
                }
              : null
          }
        />
      </div>
    </div>
  );
};
