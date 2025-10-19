import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import {
  RentalApplications,
  Incomes,
  Identities,
  Addresses,
  Tenants,
  Employment,
  SharedLeaseGroups // <-- add this collection import, define below if needed
} from '/imports/api/database/collections';
import cloudinary from 'cloudinary'; // FIX: Added cloudinary import
import { Properties } from '../../database/collections';

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
      'shared_lease_id',
      'submitted',
      'landLordFinal',
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
      inc_supporting_doc: Match.Optional(String),
      inc_public_id: Match.Optional(String),
    });

    console.log('[METHOD] incomes.insert called with:', incomeData);
    return await Incomes.insertAsync(incomeData);
  },

  async 'incomes.update'(incId, updateData) {
    check(incId, String);
    check(updateData, Object);

    const allowedFields = ['inc_type', 'inc_amt', 'inc_supporting_doc', 'inc_public_id'];

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
      identity_public_id: Match.Optional(String),
      identity_scan: Match.Optional(String),
      identity_desc: Match.Optional(String),
    });

    console.log('[METHOD] identities.insert called with:', identityDoc);
    return await Identities.insertAsync(identityDoc);
  },

  async 'identities.remove'(identityId) {
    check(identityId, String);
    console.log(`[METHOD] identities.remove called for identity_id: ${identityId}`);

    const identity = await Identities.findOneAsync({ identity_id: identityId });
    console.log('Fetched identity:', identity);

    if (!identity) {
      throw new Meteor.Error('not-found', 'Identity not found');
    }

    // Remove from Cloudinary
    if (identity.identity_public_id) {
      try {
        const result = await cloudinary.uploader.destroy(identity.identity_public_id);
        console.log(`Cloudinary asset delete result:`, result);
      } catch (err) {
        console.error('Error deleting Cloudinary asset:', err);
      }
    } else {
      console.warn('No identity_public_id found on identity document.');
    }

    // Remove from Mongo (based on internal _id)
    return await Identities.removeAsync({ _id: identity._id });
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

  // Employment
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

  async 'employment.update'(employmentId, updates) {
    check(employmentId, String);
    check(updates, {
      emp_type: Match.Maybe(String),
      emp_comp: Match.Maybe(String),
      emp_job_title: Match.Maybe(String),
      emp_start_date: Match.Maybe(Date),
      emp_verification: Match.Maybe(String),
    });

    const existing = await Employment.findOneAsync({ employment_id: employmentId }); // FIX: Added await
    if (!existing) {
      throw new Meteor.Error('not-found', 'Employment record not found');
    }

    return await Employment.updateAsync({ employment_id: employmentId }, { $set: updates });
  },

  async 'rentalApplications.addTenant'(rentalAppId, tenId) {
    check(rentalAppId, String);
    check(tenId, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized');
    }

    const tenant = await Tenants.findOneAsync({ ten_id: tenId }); // FIX: Added await
    if (!tenant) throw new Meteor.Error('Tenant not found');

    return await RentalApplications.updateAsync(
      { _id: rentalAppId },
      { $addToSet: { tenants: { ten_id: tenant.ten_id, ten_fn: tenant.ten_fn, ten_ln: tenant.ten_ln } } }
    );
  },

  async 'rentalApplications.removeTenant'(rentalAppId, tenId) {
    check(rentalAppId, String);
    check(tenId, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized');
    }

    return await RentalApplications.updateAsync(
      { _id: rentalAppId },
      { $pull: { tenants: { ten_id: tenId } } }
    );
  },

  // Shared Lease Group Methods
  async 'sharedLease.createGroup'(tenantId, propId) {
    check(tenantId, String);
    check(propId, String);

    const groupId = await SharedLeaseGroups.insertAsync({
      createdAt: new Date(),
      propId,
      members: [tenantId],
    });

    console.log(`[METHOD] sharedLease.createGroup created group ${groupId} for tenant ${tenantId}`);
    return await groupId;
  },

  async 'sharedLease.joinGroup'(groupId, tenantId) {
    check(groupId, String);
    check(tenantId, String);

    const group = await SharedLeaseGroups.findOneAsync(groupId);
    if (!group) {
      throw new Meteor.Error('Group not found');
    }

    if (!group.members.includes(tenantId)) {
      await SharedLeaseGroups.updateAsync(groupId, { $push: { members: tenantId } });
      console.log(`[METHOD] sharedLease.joinGroup tenant ${tenantId} joined group ${groupId}`);
    } else {
      console.log(`[METHOD] sharedLease.joinGroup tenant ${tenantId} already in group ${groupId}`);
    }
  },

  async 'rentalApplications.updateSharedLease'(rentalAppId, leaseId) {
    check(rentalAppId, String);
    check(leaseId, String);

    return RentalApplications.update(
      { rental_app_id: rentalAppId },
      { $set: { shared_lease_id: leaseId } }
    );
  },

    async 'sharedLease.create'(rentalAppId) {
    check(rentalAppId, String);

    // create a shared lease
    const leaseId = await SharedLease.insertAsync({
      createdAt: new Date(),
      applications: [rentalAppId],
    });

    // update the rental application with this shared lease id
    await RentalApplications.updateAsync(rentalAppId, {
      $set: { shared_lease_id: leaseId },
    });

    return leaseId;
  },

  

//Set agent flag (Shortlisted, Flagged, To be Reviewed)
 async "rentalApplications.setAgentFlag"(id, flag) {
   check(id, String);
   check(flag, String);
   console.log(
     `[METHOD] rentalApplications.setAgentFlag called for id: ${id} flag: ${flag}`
   );
   return await RentalApplications.updateAsync(id, {
     $set: { agentFlag: flag },
   });
 },


 //Clear agent flag
 async "rentalApplications.clearAgentFlag"(appId) {
   check(appId, String);

   return await RentalApplications.updateAsync(appId, {
     $unset: { agentFlag: "" }, // remove the agent flag
   });
 },


// Set landlord final decision (Approved, Rejected)
async "rentalApplications.setLandlordFinal"(id, decision) {
  check(id, String);
  check(decision, String);

  console.log(
    `[METHOD] rentalApplications.setLandlordFinal called for id: ${id} decision: ${decision}`
  );

  // 1. Find the application
  const application = await RentalApplications.findOneAsync(id);
  if (!application) {
    throw new Meteor.Error("not-found", "Rental application not found");
  }

  const propId = application.prop_id;
  if (!propId) {
    throw new Meteor.Error("invalid-data", "Application does not have a property id");
  }

  const sharedLeaseId = application.shared_lease_id || null;

  if (decision === "Approved") {
    if (sharedLeaseId) {
      // 2a. Approve all applications in the same shared lease group
      await RentalApplications.updateAsync(
        { prop_id: propId, shared_lease_id: sharedLeaseId },
        { $set: { landLordFinal: decision, status: decision } },
        { multi: true }
      );

      // 3a. Reject all *other* applications for this property (not in this shared lease group)
      await RentalApplications.updateAsync(
        { prop_id: propId, shared_lease_id: { $ne: sharedLeaseId } },
        { $set: { landLordFinal: "Rejected", status: "Rejected" } },
        { multi: true }
      );
    } else {
      // 2b. Approve only the single application
      await RentalApplications.updateAsync(id, {
        $set: { landLordFinal: decision, status: decision },
      });

      // 3b. Reject all other applications
      await RentalApplications.updateAsync(
        { prop_id: propId, _id: { $ne: id } },
        { $set: { landLordFinal: "Rejected", status: "Rejected" } },
        { multi: true }
      );
    }

    // Set Property Status to Occupied
    await Properties.updateAsync(
      { prop_id: propId },
      {$set: {prop_status: "Occupied"}}
    );

  } else if (decision === "Rejected") {
    if (sharedLeaseId) {
      // Reject all apps in the shared lease group
      await RentalApplications.updateAsync(
        { prop_id: propId, shared_lease_id: sharedLeaseId },
        { $set: { landLordFinal: "Rejected", status: "Rejected" } },
        { multi: true }
      );
    } else {
      // Reject just this one
      await RentalApplications.updateAsync(id, {
        $set: { landLordFinal: "Rejected", status: "Rejected" },
      });
    }
  }

  return true;
},


// Clear landlord final decision
async "rentalApplications.clearLandlordFinal"(appId) {
  check(appId, String);

  const application = await RentalApplications.findOneAsync(appId);
  if (!application) {
    throw new Meteor.Error("not-found", "Rental application not found");
  }

  const propId = application.prop_id;
  if (!propId) {
    throw new Meteor.Error("invalid-data", "Application does not have a property id");
  }

  const sharedLeaseId = application.shared_lease_id || null;

  if (sharedLeaseId) {
    // 1a. Clear decision for all apps in the shared lease group
    await RentalApplications.updateAsync(
      { prop_id: propId, shared_lease_id: sharedLeaseId },
      {
        $unset: { landLordFinal: "" },
        $set: { status: "Pending" },
      },
      { multi: true }
    );
  } else {
    // 1b. Clear decision for this one
    await RentalApplications.updateAsync(appId, {
      $unset: { landLordFinal: "" },
      $set: { status: "Pending" },
    });
  }

  // 2. Reset all other applications for this property too
  await RentalApplications.updateAsync(
    { prop_id: propId, shared_lease_id: { $ne: sharedLeaseId } },
    {
      $unset: { landLordFinal: "" },
      $set: { status: "Pending" },
    },
    { multi: true }
  );

  return true;
},


  async "rentalApplications.unsetLandlordFinal"(appId) {
    check(appId, String);

    const app = await RentalApplications.findOneAsync(appId);
    if (!app) throw new Meteor.Error("not-found", "Application not found");

    await RentalApplications.updateAsync(appId, {
      $unset: { landLordFinal: "" }
    });

    return true;
  },

    //Remove Tenant Application
  async "rentalApplications.removeTenant"({ propID, tenID }) {
      
    check(propID, String);
    check(tenID, String);
  
    await RentalApplications.removeAsync(
      {prop_id: propID, ten_id: tenID}
    )

    },



  async 'sharedLease.join'(leaseId, rentalAppId) {
    check(leaseId, String);
    check(rentalAppId, String);

    // add this rental application to the shared lease
    await SharedLease.updateAsync(leaseId, {
      $addToSet: { applications: rentalAppId },
    });

    // update the rental application with this shared lease id
    await RentalApplications.updateAsync(rentalAppId, {
      $set: { shared_lease_id: leaseId },
    });

    return leaseId;
  },
});

