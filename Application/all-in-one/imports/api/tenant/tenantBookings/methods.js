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
      property: Object,
      status: String,
    });

    const existing = await TenantBookings.findOneAsync({
      agentAvailabilityId: bookingData.agentAvailabilityId
    });
    if (existing) {
      throw new Meteor.Error('already-booked', 'This slot is already booked.');
    }

    if (bookingData.status === "Booked" ){
      await Meteor.callAsync('agentAvailabilities.markAsBooked', bookingData.agentAvailabilityId);
    }

    return TenantBookings.insertAsync({
      ...bookingData,
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
