import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { TenantBookings } from '/imports/api/database/collections';

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

    // prevent double-booking
    const existing = await TenantBookings.findOneAsync({
      agentAvailabilityId: bookingData.agentAvailabilityId
    });
    if (existing) {
      throw new Meteor.Error('already-booked', 'This slot is already booked.');
    }

    if (bookingData.status === "Booked" ){
      await Meteor.callAsync('agentAvailabilities.markAsBooked', bookingData.agentAvailabilityId);
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

    await TenantBookings.updateAsync({_id: bookingId}, {$set: {status: "Booked"}})

    await Meteor.callAsync('agentAvailabilities.markAsBooked', agentAvailabilityId);

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
