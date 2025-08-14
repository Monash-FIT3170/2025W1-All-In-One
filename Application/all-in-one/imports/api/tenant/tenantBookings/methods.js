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

    await Meteor.callAsync('agentAvailabilities.markAsBooked', bookingData.agentAvailabilityId);

    return TenantBookings.insertAsync({
      ...bookingData,
      createdAt: new Date(),
    });
  }
});
