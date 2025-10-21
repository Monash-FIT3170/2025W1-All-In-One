import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { AgentAvailabilities, TicketActivities } from '/imports/api/database/collections';
import { OtherActivities } from '../../database/collections';
import { Email } from "meteor/email";

Meteor.methods({
  async "agentAvailabilities.insert"(
    start,
    end,
    activity_type,
    availability_type,
    property,
    price,
    bedrooms,
    bathrooms,
    parking,
    image,
    status,
    notes,
    is_private,
    agent_id
  ) {
    try {
      console.log("[DEBUG] insert args:", {
        start,
        end,
        activity_type,
        availability_type,
        property,
        price,
        bedrooms,
        bathrooms,
        parking,
        image,
        status,
        notes,
        is_private,
      });

      check(start, String);
      check(end, String);
      check(activity_type, String);
      check(availability_type, String);
      check(property, Object);
      check(price, Match.Optional(String));
      check(bedrooms, Match.Optional(String));
      check(bathrooms, Match.Optional(String));
      check(parking, Match.Optional(String));
      check(image, Match.Optional(String));
      check(status, Match.Optional(String));
      check(notes, Match.Optional(String));
      check(is_private, Match.Optional(Boolean));
      check(agent_id, String);

      const result = await AgentAvailabilities.insertAsync({
        start,
        end,
        activity_type,
        availability_type,
        type: availability_type,
        title: `${availability_type} Availability`,
        property,
        price,
        bedrooms,
        bathrooms,
        parking,
        image,
        status,
        notes,
        agent_id,
        createdAt: new Date(),
        is_private,
      });

      console.log(`[SERVER] Inserted availability ${result}`);
      return result;
    } catch (err) {
      console.error("[SERVER ERROR] agentAvailabilities.insert:", err);
      throw new Meteor.Error("insert-failed", err.message);
    }
  },

  async "agentAvailabilities.markAsBooked"(
    availabilityId,
    { tenant, property }
  ) {
    check(availabilityId, String);
    check(tenant, { id: String, name: String });
    check(property, {
      id: Match.Optional(Match.OneOf(String, null)),
      address: Match.Optional(Match.OneOf(String, null)),
      price: Match.Optional(Match.OneOf(String, Number, null)),
      bedrooms: Match.Optional(Match.OneOf(String, Number, null)),
      bathrooms: Match.Optional(Match.OneOf(String, Number, null)),
      parking: Match.Optional(Match.OneOf(String, Number, null)),
      image: Match.Optional(Match.OneOf(String, null)),
    });

    const n = await AgentAvailabilities.updateAsync(
      { _id: availabilityId },
      {
        $set: {
          status: "booked",
          tenant,
          property,
          title: "Booked",
        },
      }
    );
    if (!n) throw new Meteor.Error("not-found", "Availability not found");
    return true;
  },

  async "agentAvailabilities.clear"() {
    console.log("Clearing all unbooked availabilities...");
    const selector = {
      $or: [{ status: { $exists: false } }, { status: { $ne: "booked" } }],
    };

    const removed = await AgentAvailabilities.removeAsync(selector);
    return { removed };
  },

  async "calendar.clearAll"() {
    await AgentAvailabilities.removeAsync({});
    await TicketActivities.removeAsync({});
    await OtherActivities.removeAsync({});
    return true;
  },

  async "agentAvailabilities.update"(id, update) {
    check(id, String);
    check(update, Object);

    const doc = await AgentAvailabilities.findOneAsync({ _id: id });
    if (!doc) throw new Meteor.Error("not-found", "Availability not found");

    const $set = {};

    // Notes can always be updated
    if (update.notes !== undefined) {
      $set.notes = String(update.notes);
    }

    // Start/end only allowed if not booked
    if (doc.status !== "booked") {
      if (update.start) $set.start = String(update.start);
      if (update.end) $set.end = String(update.end);
    }

    return AgentAvailabilities.updateAsync({ _id: id }, { $set });
  },

  async "agentAvailabilities.remove"(id) {
    check(id, String);
    const doc = await AgentAvailabilities.findOneAsync({ _id: id });
    if (!doc) throw new Meteor.Error("not-found", "Availability not found");
    if (doc.status === "booked")
      throw new Meteor.Error("forbidden", "Booked slots cannot be deleted.");
    return AgentAvailabilities.removeAsync({ _id: id });
  },

  async "agentAvailabilities.markAsRejected"(availabilityId) {
    check(availabilityId, String);

    const result = await AgentAvailabilities.updateAsync(
      { _id: availabilityId },
      { $set: { status: "rejected" } }
    );

    if (result === 0) {
      throw new Meteor.Error("not-found", "No matching availability found.");
    }

    return result;
  },

  // Tenant books a slot
  async "agentAvailabilities.bookSlot"(availabilityId, { tenant, agent }) {
    check(availabilityId, String);
    check(tenant, { id: String, name: String, email: String });
    check(agent, { id: String, name: String, email: String });

    const slot = await AgentAvailabilities.findOneAsync({
      _id: availabilityId,
    });
    if (!slot) throw new Meteor.Error("not-found", "Slot not found");
    if (slot.status === "booked")
      throw new Meteor.Error("already-booked", "This slot is already booked");

    await AgentAvailabilities.updateAsync(
      { _id: availabilityId },
      {
        $set: {
          status: "pending_confirmation",
          tenant,
        },
      }
    );

    // Send emails
    const subject = `New Inspection Booking Request - ${
      slot.property?.address || "Property"
    }`;
    const messageTenant = `
      Hi ${tenant.name},
      <br/><br/>
      You've requested an inspection for <strong>${slot.property?.address}</strong>
      on <strong>${slot.start}</strong>.<br/>
      Please wait for confirmation from your agent, ${agent.name}.
      <br/><br/>Thank you!
    `;

    const messageAgent = `
      Hi ${agent.name},
      <br/><br/>
      ${tenant.name} has requested to book an inspection for
      <strong>${slot.property?.address}</strong> on <strong>${slot.start}</strong>.
      <br/>Please confirm or reschedule the slot in your dashboard.
    `;

    try {
      Email.send({
        to: tenant.email,
        from: "noreply@propertyapp.com",
        subject,
        html: messageTenant,
      });

      Email.send({
        to: agent.email,
        from: "noreply@propertyapp.com",
        subject,
        html: messageAgent,
      });

      console.log(
        `[EMAIL] Booking emails sent to ${tenant.email} and ${agent.email}`
      );
    } catch (e) {
      console.error("[EMAIL ERROR]", e);
    }

    return true;
  },

  // Agent confirms booking
  async "agentAvailabilities.confirmBooking"(
    availabilityId,
    { agent, tenant }
  ) {
    check(availabilityId, String);
    check(agent, { id: String, name: String, email: String });
    check(tenant, { id: String, name: String, email: String });

    const slot = await AgentAvailabilities.findOneAsync({
      _id: availabilityId,
    });
    if (!slot) throw new Meteor.Error("not-found", "Slot not found");

    await AgentAvailabilities.updateAsync(
      { _id: availabilityId },
      { $set: { status: "booked", title: "Confirmed Booking" } }
    );

    const subject = `Inspection Confirmed - ${slot.property?.address}`;
    const message = `
      Hi ${tenant.name},
      <br/><br/>
      Your inspection at <strong>${slot.property?.address}</strong> has been confirmed for <strong>${slot.start}</strong>.
      <br/><br/>
      Regards,<br/>${agent.name}
    `;

    try {
      Email.send({
        to: tenant.email,
        from: agent.email,
        subject,
        html: message,
      });
    } catch (e) {
      console.error("[EMAIL ERROR] confirmBooking:", e);
    }

    return true;
  },

  // Agent reschedules booking
  async "agentAvailabilities.rescheduleBooking"(
    availabilityId,
    newStart,
    { agent, tenant }
  ) {
    check(availabilityId, String);
    check(newStart, String);
    check(agent, { id: String, name: String, email: String });
    check(tenant, { id: String, name: String, email: String });

    const slot = await AgentAvailabilities.findOneAsync({
      _id: availabilityId,
    });
    if (!slot) throw new Meteor.Error("not-found", "Slot not found");

    await AgentAvailabilities.updateAsync(
      { _id: availabilityId },
      { $set: { start: newStart, status: "rescheduled" } }
    );

    const subject = `Inspection Rescheduled - ${slot.property?.address}`;
    const message = `
      Hi ${tenant.name},
      <br/><br/>
      Your inspection for <strong>${slot.property?.address}</strong> has been rescheduled to <strong>${newStart}</strong>.
      <br/><br/>
      Regards,<br/>${agent.name}
    `;

    try {
      Email.send({
        to: tenant.email,
        from: agent.email,
        subject,
        html: message,
      });
    } catch (e) {
      console.error("[EMAIL ERROR] rescheduleBooking:", e);
    }

    return true;
  },
});