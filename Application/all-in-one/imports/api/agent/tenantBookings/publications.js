import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { TenantBookings } from '/imports/api/database/collections';

// Publish tenant bookings for a specific availability so agents can see invitee info
Meteor.publish('tenantBookings.forAvailability', function (availabilityId) {
  check(availabilityId, String);
  return TenantBookings.find({ agentAvailabilityId: availabilityId });
});
