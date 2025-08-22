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
      property: Object,   // snapshot you already have
      status: String,
    });

    const existing = await TenantBookings.findOneAsync({
      agentAvailabilityId: bookingData.agentAvailabilityId
    });
    if (existing) throw new Meteor.Error('already-booked', 'This slot is already booked.');

    // ⬇️ include tenant + property when marking as booked
    await Meteor.callAsync(
      'agentAvailabilities.markAsBooked',
      bookingData.agentAvailabilityId,
      {
        tenant: { id: bookingData.tenantId, name: bookingData.tenantName },
        property: bookingData.property   // optional if you want to lock a snapshot
      }
    );

    return TenantBookings.insertAsync({
      ...bookingData,
      createdAt: new Date(),
    });
  }
});
