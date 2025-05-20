import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { RentalApplications, Incomes, Identities } from '/imports/api/database/collections';

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

    // Optional: restrict updates to known fields only
    const allowedFields = [
      'prop_id',
      'lease_start_date',
      'lease_term',
      'app_rent',
      'rental_app_prop_inspected',
      'ten_id',
      'employment_id',
      'status',
      'household_pets',
      'pet_description',
      'emergency_contact_id',
      'rental_app_id',
    ];

    const sanitizedUpdate = Object.fromEntries(
      Object.entries(updateData).filter(([key]) => allowedFields.includes(key))
    );

    console.log(`[METHOD] rentalApplications.update called for id: ${id}`, sanitizedUpdate);
    return await RentalApplications.updateAsync(id, { $set: sanitizedUpdate });
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

  // Identities
  async 'identities.insert'(identityDoc) {
    check(identityDoc, {
      identity_id: String,
      rental_app_id: String,
      identity_type: String,
      identity_scan: String,
    });

    return await Identities.insertAsync(identityDoc);
  },

  async 'identities.remove'(identityId) {
    check(identityId, String);
    return await Identities.removeAsync({ identity_id: identityId });
  },
});
