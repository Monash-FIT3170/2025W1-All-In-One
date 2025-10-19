import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { TenantBookings } from "/imports/api/database/collections";
import { AgentAvailabilities } from "../../database/collections";
//import { AgentAvailabilities, TenantBookings } from '/imports/api/database/collections';

Meteor.methods({
  async "tenantBookings.insert"(bookingData) {
    check(bookingData, {
      agentAvailabilityId: String,
      tenantName: String,
      tenantId: String,
      start: Date,
      end: Date,
      property: Match.ObjectIncluding({
        id: Match.Optional(Match.OneOf(String, null)),
        address: Match.Optional(Match.OneOf(String, null)),
        price: Match.Optional(Match.OneOf(String, Number, null)),
        bedrooms: Match.Optional(Match.OneOf(String, Number, null)),
        bathrooms: Match.Optional(Match.OneOf(String, Number, null)),
        parking: Match.Optional(Match.OneOf(String, Number, null)),
        image: Match.Optional(Match.OneOf(String, null)),
      }),
      status: String,
    });

    const tenant = {
      id: bookingData.tenantId,
      name: bookingData.tenantName,
    };
    const property = bookingData.property;
    const bookingID = bookingData.agentAvailabilityId;
    const agentAvailability = await AgentAvailabilities.findOneAsync({
      _id: bookingID,
    });

    // prevent double-booking for inspections
    if (agentAvailability.availability_type === "Inspection") {
      const existing = await TenantBookings.findOneAsync({
        agentAvailabilityId: bookingID,
      });
      if (existing) {
        throw new Meteor.Error(
          "already-booked",
          "This slot is already booked."
        );
      }

      if (bookingData.status === "Booked") {
        await Meteor.callAsync("agentAvailabilities.markAsBooked", bookingID, {
          tenant: tenant,
          property: bookingData.property,
        });
      }
    }

    // insert tenant booking record with property snapshot
    if (!this.userId) throw new Meteor.Error("not-authorized");

    const avId = bookingData.agentAvailabilityId;

    // 1) Atomically claim the slot: only succeed if not already booked
    const claimed = await AgentAvailabilities.updateAsync(
      { _id: avId, status: { $ne: "booked" } },
      {
        $set: {
          status: "booked",
          bookedBy: this.userId,
          bookedAt: new Date(),
          tenant: { id: bookingData.tenantId, name: bookingData.tenantName }, // optional, shows in agent modal
          property: bookingData.property, // Update with actual property information from the booking
          // Also update individual fields for compatibility
          address: bookingData.property.address,
          price: bookingData.property.price,
          bedrooms: bookingData.property.bedrooms,
          bathrooms: bookingData.property.bathrooms,
          parking: bookingData.property.parking,
          image: bookingData.property.image,
        },
      }
    );
    if (claimed === 0) {
      throw new Meteor.Error(
        "already-booked",
        "This slot was just booked by someone else."
      );
    }

    // Insert tenant booking record (keep a snapshot for history)
    return TenantBookings.insertAsync({
      agentAvailabilityId: avId,
      tenantId: bookingData.tenantId,
      tenantName: bookingData.tenantName,
      start: bookingData.start,
      end: bookingData.end,
      property: bookingData.property,
      status: "booked",
      createdAt: new Date(),
    });
  },

  async "tenantBookings.markAsRejected"(bookingId, agentAvailabilityId) {
    check(bookingId, String);
    check(agentAvailabilityId, String);

    //`const tenantBooking = await TenantBookings.findOneAsync({_id: bookingId});
    //const tenant = {
    //  id: tenantBooking.tenantId,
    //  name: tenantBooking.tenantName
    //};
    //const property = tenantBooking.property;

    //await TenantBookings.updateAsync({_id: bookingId}, {$set: {status: "Booked"}})

    //await Meteor.callAsync('agentAvailabilities.markAsBooked', agentAvailabilityId, {tenant: tenant, property: property});`

    await TenantBookings.updateAsync(
      { _id: bookingId },
      { $set: { status: "rejected" } }
    );
    await AgentAvailabilities.updateAsync(
      { _id: agentAvailabilityId },
      {
        $set: { status: "confirmed" },
        $unset: { bookedBy: "", bookedAt: "", tenant: "" },
      } // free the slot
    );
  },

  async "tenantBookings.reschedule"(bookingId, newTime) {
    check(bookingId, String);
    check(newTime, String);

    const booking = TenantBookings.findOne(bookingId);
    if (!booking) throw new Meteor.Error("not-found", "Booking not found");

    TenantBookings.update(bookingId, {
      $set: {
        requestedReschedule: new Date(newTime),
        status: "reschedule_pending",
      },
    });

    // Optionally send email notification to agent
    Meteor.call("sendBookingEmail", {
      ...booking,
      rescheduleRequested: newTime,
      subject: `Reschedule Requested for ${booking.property.address}`,
    });
  },
});