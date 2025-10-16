import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Random } from 'meteor/random'; // ✅ Add this line

import {
  RentalApplications,
  Incomes,
  Identities,
  Addresses,
  Tenants,
  Employment,
  SharedLeaseGroups,
  Properties // <-- added Properties import
} from '/imports/api/database/collections';
import cloudinary from 'cloudinary'; // FIX: Added cloudinary import

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

  async 'sharedLease.createGroup'(tenantId, propId) {
  check(tenantId, String);
  check(propId, String);

  console.log('[METHOD] sharedLease.createGroup called with:', { tenantId, propId, caller: this.userId });

  try {
    // create a short unique id for the shared lease
    const groupId = `SL-${Random.id(8)}`;

    // Update rental application(s) for this prop and tenant to reference groupId
    const selector = {
      prop_id: propId,
      $or: [
        { ten_id: tenantId },
        { tenants: { $elemMatch: { ten_id: tenantId } } },
      ],
    };

    const update = { $set: { shared_lease_id: groupId } };

    const result = await RentalApplications.updateAsync(selector, update, { multi: true });

    console.log('[METHOD] sharedLease.createGroup created groupId:', groupId, 'updatedCount:', result);

    // If no application was updated, still return the id so client can decide next steps
    return groupId;
  } catch (err) {
    console.error('Error in sharedLease.createGroup:', err && err.stack ? err.stack : err);
    if (err instanceof Meteor.Error) throw err;
    throw new Meteor.Error('sharedLease.createGroup-failed', err && err.message ? err.message : 'Unknown server error');
  }
},

// Join an existing shared-lease id: attach it to any application(s) for the tenant
async 'sharedLease.joinGroup'(groupId, tenantId) {
  check(groupId, String);
  check(tenantId, String);

  console.log('[METHOD] sharedLease.joinGroup called with:', { groupId, tenantId, caller: this.userId });

  try {
    const selector = {
      $or: [
        { ten_id: tenantId },
        { tenants: { $elemMatch: { ten_id: tenantId } } },
      ],
    };

    const update = { $set: { shared_lease_id: groupId } };

    const result = await RentalApplications.updateAsync(selector, update, { multi: true });

    console.log('[METHOD] sharedLease.joinGroup attached group to applications:', result);

    // If you'd like, return the number of documents updated:
    return { groupId, updatedCount: result };
  } catch (err) {
    console.error('Error in sharedLease.joinGroup:', err && err.stack ? err.stack : err);
    if (err instanceof Meteor.Error) throw err;
    throw new Meteor.Error('sharedLease.joinGroup-failed', err && err.message ? err.message : 'Unknown server error');
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
    console.log('[METHOD] sharedLease.create called for rentalAppId:', rentalAppId);

    try {
      // ensure rental application exists
      const app = await RentalApplications.findOneAsync({ _id: rentalAppId });
      if (!app) throw new Meteor.Error('not-found', 'Rental application not found');

      const groupDoc = {
        createdAt: new Date(),
        propId: app.prop_id || null,
        applications: [rentalAppId],
        members: (app.ten_id ? [app.ten_id] : []),
      };

      const groupId = await SharedLeaseGroups.insertAsync(groupDoc);
      console.log('[METHOD] sharedLease.create created groupId:', groupId);

      await RentalApplications.updateAsync({ _id: rentalAppId }, { $set: { shared_lease_id: groupId } });

      return groupId;
    } catch (err) {
      console.error('Error in sharedLease.create:', err && err.stack ? err.stack : err);
      if (err instanceof Meteor.Error) throw err;
      throw new Meteor.Error('sharedLease.create-failed', err && err.message ? err.message : 'Unknown error');
    }
  },

  // join an existing shared lease group (client calls "sharedLease.join")
  async 'sharedLease.join'(groupId, tenantId, rentalAppId) {
    // Accept either (groupId, tenantId) or (groupId, tenantId, rentalAppId)
    check(groupId, String);
    check(tenantId, String);
    if (rentalAppId !== undefined) check(rentalAppId, String);

    console.log('[METHOD] sharedLease.join called', { groupId, tenantId, rentalAppId });

    try {
      const group = await SharedLeaseGroups.findOneAsync({ _id: groupId });
      if (!group) throw new Meteor.Error('group-not-found', 'Shared lease group not found');

      // add tenant to members array if not present
      if (!Array.isArray(group.members) || !group.members.includes(tenantId)) {
        await SharedLeaseGroups.updateAsync({ _id: groupId }, { $addToSet: { members: tenantId } });
        console.log(`[METHOD] sharedLease.join added tenant ${tenantId} to group ${groupId}`);
      } else {
        console.log(`[METHOD] sharedLease.join tenant ${tenantId} already member of ${groupId}`);
      }

      // optionally add rental application id to group's applications and set rentalApplications.shared_lease_id
      if (rentalAppId) {
        await SharedLeaseGroups.updateAsync({ _id: groupId }, { $addToSet: { applications: rentalAppId } });
        await RentalApplications.updateAsync({ _id: rentalAppId }, { $set: { shared_lease_id: groupId } });
      }

      return groupId;
    } catch (err) {
      console.error('Error in sharedLease.join:', err && err.stack ? err.stack : err);
      if (err instanceof Meteor.Error) throw err;
      throw new Meteor.Error('sharedLease.join-failed', err && err.message ? err.message : 'Unknown error');
    }
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

  // ----- NEW METHOD: set tenant_id and optionally inspected_date on Properties -----
  async 'properties.setTenantId'(propId, tenantId, inspectedDate) {
    check(propId, String);
    // tenantId can be String or null (for clearing)
    check(tenantId, Match.OneOf(String, null));
    // inspectedDate is optional; if provided it must be a Date or null
    if (inspectedDate !== undefined) check(inspectedDate, Match.OneOf(Date, null));

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to perform this action');
    }

    // ensure property exists
    const property = await Properties.findOneAsync({ prop_id: propId });
    if (!property) {
      throw new Meteor.Error('not-found', 'Property not found');
    }

    // optional: ensure the current user owns the property (if landlord_id field exists)
    if (property.landlord_id && property.landlord_id !== this.userId) {
      throw new Meteor.Error('not-authorized', 'You do not own this property');
    }

    // Prepare the fields to set
    const fieldsToSet = { tenant_id: tenantId };
    // Only set inspected_date if the argument was explicitly provided (so clearing decision won't null it)
    if (inspectedDate !== undefined) {
      fieldsToSet.inspected_date = inspectedDate;
    }

    const result = await Properties.updateAsync(
      { prop_id: propId },
      { $set: fieldsToSet }
    );

    if (result === 0) {
      throw new Meteor.Error('update-failed', 'Failed to set tenant on property');
    }

    return true;
  },

'properties.getAllWithTenants'() {
  if (!this.userId) {
    throw new Meteor.Error('not-authorized', 'You must be logged in to perform this action');
  }

  const properties = Properties.find({ tenant_id: { $exists: true, $ne: null } }).fetch();

  const result = properties.map((prop) => {
    // Convert prop to plain object
    const propObj = {
      prop_id: prop.prop_id,
      landlord_id: prop.landlord_id,
      tenant_id: prop.tenant_id,
      inspected_date: prop.inspected_date,
      address: prop.address || null,
      ...prop // include other fields safely
    };

    const tenant = Tenants.findOne({ ten_id: prop.tenant_id });
    const employment = tenant ? Employment.findOne({ ten_id: tenant.ten_id }) : null;

    // Calculate inspection status label
    let inspectionLabel = null;
    if (prop.inspected_date) {
      const today = new Date();
      const inspectedDate = new Date(prop.inspected_date);
      const monthsDiff = (today.getFullYear() - inspectedDate.getFullYear()) * 12
                       + (today.getMonth() - inspectedDate.getMonth());

      if (monthsDiff >= 5 && monthsDiff < 6) inspectionLabel = 'upcoming';
      else if (monthsDiff >= 6) inspectionLabel = 'overdue';
    }

    return {
      ...propObj,
      tenantInfo: tenant
        ? {
            ten_id: tenant.ten_id,
            ten_fn: tenant.ten_fn,
            ten_ln: tenant.ten_ln,
            ten_pn: tenant.ten_pn,
            ten_dob: tenant.ten_dob,
            emp_job_title: employment ? employment.emp_job_title : '—',
          }
        : null,
      inspectionLabel,
    };
  });

  return result.filter(Boolean);
}

});
