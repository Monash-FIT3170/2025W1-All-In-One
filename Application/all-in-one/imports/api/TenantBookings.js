import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export const TenantBookings = new Mongo.Collection('tenantBookings');

if (Meteor.isServer) {
  Meteor.publish('tenantBookings', function () {
    return TenantBookings.find({ tenantId: this.userId });
  });
}

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

    const existing = await TenantBookings.findOne({ agentAvailabilityId: bookingData.agentAvailabilityId });
    if (existing) {
      throw new Meteor.Error('already-booked', 'This slot is already booked.');
    }

    await Meteor.callAsync('agentAvailabilities.markAsBooked', bookingData.agentAvailabilityId);

    return TenantBookings.insert({
      ...bookingData,
      createdAt: new Date(),
    });
  },
});
