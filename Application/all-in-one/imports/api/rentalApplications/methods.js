import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { RentalApplications, Incomes } from '/imports/api/database/collections';

Meteor.methods({
  // Rental Applications
  async 'rentalApplications.insert'(applicationData) {
    check(applicationData, Object);
    console.log('[METHOD] rentalApplications.insert called with:', applicationData);
    return await RentalApplications.insertAsync(applicationData);
  },

  async 'rentalApplications.setStatus'(id, status) {
    check(id, String);
    check(status, String);
    return await RentalApplications.updateAsync(id, { $set: { status } });
  },

  async 'rentalApplications.update'(id, updateData) {
    check(id, String);
    check(updateData, Object);
    console.log(`[METHOD] rentalApplications.update called for id: ${id}`, updateData);
    return await RentalApplications.updateAsync(id, { $set: updateData });
  },

  // Incomes
  async 'incomes.insert'(incomeData) {
    check(incomeData, {
      inc_id: String,
      rental_app_id: String,
      inc_type: String,
      inc_amt: Number,
      inc_supporting_doc: String,
    });
    console.log('[METHOD] incomes.insert called with:', incomeData);
    return await Incomes.insertAsync(incomeData);
  },

  async 'incomes.update'(id, updateData) {
    check(id, String);
    check(updateData, Object);
    console.log(`[METHOD] incomes.update called for id: ${id}`, updateData);
    return await Incomes.updateAsync(id, { $set: updateData });
  },

  async 'incomes.remove'(incId) {
    check(incId, String);
    console.log(`[METHOD] incomes.remove called for inc_id: ${incId}`);
    return await Incomes.removeAsync({ inc_id: incId });
  },
});
