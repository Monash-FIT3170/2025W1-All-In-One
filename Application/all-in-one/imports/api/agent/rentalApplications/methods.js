import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { RentalApplications } from '../../database/collections';

Meteor.methods({
  async 'rentalApplications.setStatus'(id, status) {
    check(id, String);
    check(status, String);
    await RentalApplications.updateAsync(id, { $set: { status } });
  },
});