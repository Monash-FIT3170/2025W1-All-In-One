import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { RentalApplications } from '/imports/api/database/collections';

Meteor.methods({
  async 'rentalApplications.insert'(applicationData) {
    console.log('[METHOD] rentalApplications.insert called with:', applicationData);

    check(applicationData, Object);
    return await RentalApplications.insertAsync(applicationData);
  },

  async 'rentalApplications.setStatus'(id, status) {
    check(id, String);
    check(status, String);
    await RentalApplications.updateAsync(id, { $set: { status } });
  },

  async 'rentalApplications.update'(id, updateData) {
    check(id, String);
    check(updateData, Object);

    console.log(`[METHOD] rentalApplications.update called for id: ${id}`, updateData);

    return await RentalApplications.updateAsync(id, {
      $set: updateData,
    });
  },
});
