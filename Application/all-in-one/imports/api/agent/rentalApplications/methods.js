import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { RentalApplications, Incomes, Identities, Addresses, Tenants,Employment } from '/imports/api/database/collections';

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
    console.log(`[METHOD] rentalApplications.setStatus called for id: ${id} status: ${status}`);
    return await RentalApplications.updateAsync(id, { $set: { status } });
  },

  async 'rentalApplications.update'(id, updateData) {
    check(id, String);
    check(updateData, Object);

    const allowedFields = [
      'prop_id',
      'lease_start_date',
      'lease_term',
      'app_rent',
      'app_desc',
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

  async 'incomes.update'(incId, updateData) {
    check(incId, String);
    check(updateData, Object);

    const allowedFields = ['inc_type', 'inc_amt', 'inc_supporting_doc'];

    const sanitizedUpdate = Object.fromEntries(
      Object.entries(updateData).filter(([key]) => allowedFields.includes(key))
    );

    console.log(`[METHOD] incomes.update called for inc_id: ${incId}`, sanitizedUpdate);
    return await Incomes.updateAsync({ inc_id: incId }, { $set: sanitizedUpdate });
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

    console.log('[METHOD] identities.insert called with:', identityDoc);
    return await Identities.insertAsync(identityDoc);
  },

  async 'identities.remove'(identityId) {
    check(identityId, String);
    console.log(`[METHOD] identities.remove called for identity_id: ${identityId}`);
    return await Identities.removeAsync({ identity_id: identityId });
  },

  // Tenants
  async 'tenants.update'(tenId, updateData) {
    check(tenId, String);
    check(updateData, Object);

    const allowedFields = ['ten_fn', 'ten_ln', 'ten_pn', 'ten_dob'];

    const sanitizedUpdate = Object.fromEntries(
      Object.entries(updateData).filter(([key]) => allowedFields.includes(key))
    );

    console.log(`[METHOD] tenants.update called for ten_id: ${tenId}`, sanitizedUpdate);

    const result = await Tenants.updateAsync(
      { ten_id: tenId },
      { $set: sanitizedUpdate }
    );

    if (result === 0) {
      throw new Meteor.Error('tenant-not-found', 'Tenant not found');
    }

    return result;
  },

  // Addresses
  async 'addresses.insert'(addressData) {
    check(addressData, {
      address_id: String,
      rental_app_id: String,
      address_address: String,
      address_movein: Date,
      address_moveout: Date,
      address_ownership: String,
      address_reference_type: String,
      address_reference_name: String,
      address_reference_email: String,
      address_reference_number: String,
      address_status: String,
    });

    console.log('[METHOD] addresses.insert called with:', addressData);
    return await Addresses.insertAsync(addressData);
  },

  async 'addresses.update'(addressData) {
    check(addressData, {
      address_id: String,
      rental_app_id: String,
      address_address: String,
      address_movein: Date,
      address_moveout: Date,
      address_ownership: String,
      address_reference_type: String,
      address_reference_name: String,
      address_reference_email: String,
      address_reference_number: String,
      address_status: String,
    });

    console.log('[METHOD] addresses.update called with:', addressData);
    return await Addresses.updateAsync(
      { address_id: addressData.address_id },
      { $set: addressData }
    );
  },

  async 'addresses.remove'(addressId) {
    check(addressId, String);
    console.log(`[METHOD] addresses.remove called for address_id: ${addressId}`);
    return await Addresses.removeAsync({ address_id: addressId });
  },

  async 'employment.insert'(employmentData) {
  check(employmentData, {
    employment_id: String,
    ten_id: String,
    emp_type: String,
    emp_comp: String,
    emp_job_title: String,
    emp_start_date: Date,
    emp_verification: String,
  });

  return await Employment.insertAsync(employmentData);
},

  'employment.update'(employmentId, updates) {
    check(employmentId, String);
    check(updates, {
      emp_type: Match.Maybe(String),
      emp_comp: Match.Maybe(String),
      emp_job_title: Match.Maybe(String),
      emp_start_date: Match.Maybe(Date),
      emp_verification: Match.Maybe(String),
    });

    const existing = Employment.findOne({ employment_id: employmentId });
    if (!existing) {
      throw new Meteor.Error('not-found', 'Employment record not found');
    }

    return Employment.update({ employment_id: employmentId }, { $set: updates });
  }
});
