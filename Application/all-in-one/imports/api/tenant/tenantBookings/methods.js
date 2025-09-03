import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { TenantBookings } from '/imports/api/database/collections';
import { AgentAvailabilities } from '../../database/collections';

Meteor.methods({
  async 'tenantBookings.insert'(bookingData) {
    check(bookingData, {
      agentAvailabilityId: String,
      tenantName: String,
      tenantId: String,
      start: Date,
      end: Date,
      property: {
        id: String,
        address: String,
        price: Match.Optional(Match.OneOf(String, Number)),
        bedrooms: Match.Optional(Match.OneOf(String, Number)),
        bathrooms: Match.Optional(Match.OneOf(String, Number)),
        parking: Match.Optional(Match.OneOf(String, Number)),
        image: Match.Optional(String),
      },
      status: String,
    });

    const tenant = {
      id: bookingData.tenantId,
      name: bookingData.tenantName
    };
    const property = bookingData.property;
    const bookingID = bookingData.agentAvailabilityId;
    const agentAvailability = await AgentAvailabilities.findOneAsync({_id: bookingID});
    
    // prevent double-booking for inspections
    if (agentAvailability.availability_type === "Inspection"){
      const existing = await TenantBookings.findOneAsync({
        agentAvailabilityId: bookingID
      });
      if (existing) {
        throw new Meteor.Error('already-booked', 'This slot is already booked.');
      }

      if (bookingData.status === "Booked" ) {
        await Meteor.callAsync('agentAvailabilities.markAsBooked', bookingID, {tenant: tenant, property: bookingData.property});
      }
    }


    // insert tenant booking record with property snapshot
    return TenantBookings.insertAsync({
      agentAvailabilityId: bookingData.agentAvailabilityId,
      tenantId: bookingData.tenantId,
      tenantName: bookingData.tenantName,
      start: bookingData.start,
      end: bookingData.end,
      property: bookingData.property,
      status: bookingData.status,
      createdAt: new Date(),
    });
  },

  async 'tenantBookings.markAsBooked' (bookingId, agentAvailabilityId) {
    check(bookingId, String);
    check(agentAvailabilityId, String);

    const tenantBooking = await TenantBookings.findOneAsync({_id: bookingId});
    const tenant = {
      id: tenantBooking.tenantId,
      name: tenantBooking.tenantName
    };
    const property = tenantBooking.property;

    await TenantBookings.updateAsync({_id: bookingId}, {$set: {status: "Booked"}})

    await Meteor.callAsync('agentAvailabilities.markAsBooked', agentAvailabilityId, {tenant: tenant, property: property});

  },

    async 'tenantBookings.markAsRejected' (bookingId, agentAvailabilityId) {
    check(bookingId, String);
    check(agentAvailabilityId, String);

    const result = await TenantBookings.updateAsync(
      {_id: bookingId}, {$set: {status: "Rejected"}})
      &&
      await Meteor.callAsync('agentAvailabilities.markAsRejected', agentAvailabilityId);

  },

});
