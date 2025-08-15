import { Meteor } from 'meteor/meteor';
import { TenantBookings } from '/imports/api/database/collections';

Meteor.publish('tenantBookings', function () {
  return TenantBookings.find({ tenantId: this.userId });
});
