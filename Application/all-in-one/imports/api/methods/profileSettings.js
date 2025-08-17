import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import {
  Ten_SettingsAddresses,
  Ten_SettingsEmployment,
  Ten_SettingsIdentities,
  Ten_SettingsIncomes,
  Tenants
} from "/imports/api/database/collections";
import { Random } from "meteor/random";

Meteor.methods({
  // Incomes of tenant
  async "tenantIncomes.insert"(incomeData) {
    check(incomeData, {
      //inc_id: String, - autigenerate here instead - more secure?
      ten_id: String,
      inc_type: String,
      inc_amt: Number,
      inc_supporting_doc: Match.Optional(String), // Changed to optional
      inc_public_id: Match.Optional(String) // Added this field
    });

    const record = {
      inc_id: Random.id(),
      ten_id: this.userId,
      ...incomeData
    };

    console.log("[METHOD] tenantIncomes.insert called with:", record);
    return await Ten_SettingsIncomes.insertAsync(record);
  },

  async "tenantIncomes.update"(incId, updateData) {
    check(incId, String);
    check(updateData, Object);

    const allowedFields = [
      "inc_type",
      "inc_amt",
      "inc_supporting_doc",
      "inc_public_id"
    ]; // Added inc_public_id

    const sanitizedUpdate = Object.fromEntries(
      Object.entries(updateData).filter(([key]) => allowedFields.includes(key))
    );

    console.log(
      `[METHOD] tenantIncomes.update called for inc_id: ${incId}`,
      sanitizedUpdate
    );

    // ownership check: only update if this income belongs to the logged-in tenant
    const result = await Ten_SettingsIncomes.updateAsync(
      { inc_id: incId, ten_id: this.userId },
      { $set: sanitizedUpdate }
    );

    if (result === 0) {
      throw new Meteor.Error("Update failed or unauthorized");
    }

    return result;
  },

  async "tenantIncomes.remove"(incId) {
    check(incId, String);
    console.log(`[METHOD] incomes.remove called for inc_id: ${incId}`);
    return await Ten_SettingsIncomes.removeAsync({
      inc_id: incId,
      ten_id: this.userId
    });
  },

  // Identities
  async "tenantIdentities.insert"(identityDoc) {
    check(identityDoc, {
      identity_id: String,
      ten_id: String,
      identity_type: String,
      identity_public_id: Match.Optional(String),
      identity_scan: Match.Optional(String),
      identity_desc: Match.Optional(String)
    });

    console.log("[METHOD] tenantIdentities.insert called with:", identityDoc);
    return await Ten_SettingsIdentities.insertAsync(identityDoc);
  },

  async "tenantIdentities.update"(identityId, updateFields) {
    check(identityId, String);
    check(updateFields, {
      identity_type: String,
      identity_public_id: Match.Optional(String),
      identity_scan: Match.Optional(String),
      identity_desc: Match.Optional(String)
    });

    const identity = await Ten_SettingsIdentities.findOneAsync({
      identity_id: identityId
    });
    if (!identity) {
      throw new Meteor.Error("not-found", "Identity not found");
    }

    console.log(
      `[METHOD] tenantIdentities.update called for identity_id: ${identityId}`,
      updateFields
    );
    return await Ten_SettingsIdentities.updateAsync(
      { identity_id: identityId },
      { $set: updateFields }
    );
  },

  async "tenantIdentities.remove"(identityId) {
    check(identityId, String);
    console.log(
      `[METHOD] tenantIdentities.remove called for identity_id: ${identityId}`
    );

    const identity = await Ten_SettingsIdentities.findOneAsync({
      identity_id: identityId
    });
    console.log("Fetched identity:", identity);

    if (!identity) {
      throw new Meteor.Error("not-found", "Identity not found");
    }

    // Remove from Mongo (based on internal _id)
    return await Ten_SettingsIdentities.removeAsync({ _id: identity._id });
  },

  // Tenants
  async "tenantsProfile.update"(tenId, updateData) {
    // Add debugging to see exactly what we received
    console.log(
      "Raw updateData received:",
      JSON.stringify(updateData, null, 2)
    );
    console.log(
      "ten_fn type:",
      typeof updateData.ten_fn,
      "value:",
      updateData.ten_fn
    );
    console.log(
      "ten_ln type:",
      typeof updateData.ten_ln,
      "value:",
      updateData.ten_ln
    );
    console.log(
      "ten_pn type:",
      typeof updateData.ten_pn,
      "value:",
      updateData.ten_pn
    );
    console.log("tenid: ", tenId);

    check(tenId, String);
    check(updateData, {
      ten_fn: String, // tenant first name is required
      ten_ln: String, // tenant last name is required
      ten_email: String, // tenant email is reuqired
      ten_pn: Match.OneOf(String, null, undefined), // tenant phone number is optional
      ten_dob: Match.OneOf(Date, null, undefined) // tenant date of birth is optional
    });

    // validate optional feilds- no empty strings
    if (!updateData.ten_fn.trim()) {
      throw new Meteor.Error("invalid-data", "First name is required");
    }

    if (!updateData.ten_ln.trim()) {
      throw new Meteor.Error("invalid-data", "Last name is required");
    }

    if (!updateData.ten_email.trim()) {
      throw new Meteor.Error("invalid-data", "Email is required");
    }

    // prepare cleaned object
    const cleanedUpdate = {
      ten_fn: updateData.ten_fn.trim(),
      ten_ln: updateData.ten_ln.trim(),
      ten_email: updateData.ten_email.trim(),
      ten_dob: updateData.ten_dob || new Date(0)
    };

    // only include optional feilds if they're not null/defined
    if (updateData.ten_pn != null && updateData.ten_pn !== undefined) {
      cleanedUpdate.ten_pn = updateData.ten_pn.trim();
    }

    // update tenants collection
    const tenantResult = await Tenants.updateAsync(
      { ten_id: tenId },
      { $set: cleanedUpdate }
    );

    if (tenantResult === 0) {
      throw new Meteor.Error("tenant-not-found", "Tenant not found");
    }

    // sync meteor.users
    await Meteor.users.updateAsync(
      { _id: tenId },
      {
        $set: {
          "profile.firstName": cleanedUpdate.ten_fn,
          "profile.lastName": cleanedUpdate.ten_ln,
          "emails.0.address": cleanedUpdate.ten_email
        }
      }
    );

    console.log("Profile update successful for tenant:", tenId);
    return true;
  },

  // Tenant Addresses
  async "tenantAddresses.insert"(addressData) {
    check(addressData, {
      address_id: String,
      ten_id: String,
      address_address: String,
      address_movein: Date,
      address_moveout: Match.OneOf(Date, null),
      address_ownership: String,
      address_reference_type: String,
      address_reference_name: String,
      address_reference_email: String,
      address_reference_number: String,
      address_status: String
    });

    console.log("[METHOD] tenantAddresses.insert called with:", addressData);
    return await Ten_SettingsAddresses.insertAsync(addressData);
  },

  async "tenantAddresses.update"(addressId, addressData) {
    console.log("[METHOD] tenantAddresses.update called with:", {
      addressId,
      addressData
    });
    check(addressId, String);
    check(addressData, {
      address_address: Match.Maybe(String),
      address_movein: Match.Maybe(Date),
      address_moveout: Match.OneOf(Date, null, undefined),
      address_ownership: Match.Maybe(String),
      address_reference_type: Match.Maybe(String),
      address_reference_name: Match.Maybe(String),
      address_reference_email: Match.Maybe(String),
      address_reference_number: Match.Maybe(String),
      address_status: Match.Maybe(String)
    });

    const allowedFields = [
      "address_address",
      "address_movein",
      "address_moveout",
      "address_ownership",
      "address_reference_type",
      "address_reference_name",
      "address_reference_email",
      "address_reference_number",
      "address_status"
    ];

    const sanitizedUpdate = Object.fromEntries(
      Object.entries(addressData).filter(([key]) => allowedFields.includes(key))
    );

    if (Object.keys(sanitizedUpdate).length === 0) {
      throw new Meteor.Error(
        "no-update-fields",
        "No valid fields provided for update."
      );
    }

    console.log(
      "[METHOD] tenantAddresses.update called with:",
      sanitizedUpdate
    );
    return await Ten_SettingsAddresses.updateAsync(
      { address_id: addressId },
      { $set: sanitizedUpdate }
    );
  },

  async "tenantAddresses.remove"(addressId) {
    check(addressId, String);
    console.log(
      `[METHOD] tenantAddresses.remove called for address_id: ${addressId}`
    );
    return await Ten_SettingsAddresses.removeAsync({ address_id: addressId });
  },

  async "tenantEmployment.insert"(employmentData) {
    check(employmentData, {
      // employment_id: String, autogenerated with Random.id() below
      //ten_id: String, get from this.userId more secure that passing it on
      emp_type: String,
      emp_comp: String,
      emp_job_title: String,
      emp_start_date: Date,
      emp_verification: String
    });

    const record = {
      employment_id: Random.id(),
      ten_id: this.userId,
      ...employmentData
    };

    console.log("[METHOD] tenantEmployment.insert called with:", record);

    return await Ten_SettingsEmployment.insertAsync(record);
  },

  async "tenantEmployment.update"(employmentId, updates) {
    check(employmentId, String);
    check(updates, Object);

    const allowedFields = [
      "emp_type",
      "emp_comp",
      "emp_job_title",
      "emp_start_date",
      "emp_verification"
    ];

    const sanitizedUpdate = Object.fromEntries(
      Object.entries(updates).filter(([key]) => allowedFields.includes(key))
    );

    // ownership check
    const existing = await Ten_SettingsEmployment.findOneAsync({
      employment_id: employmentId,
      ten_id: this.userId
    });
    if (!existing)
      throw new Meteor.Error(
        "not-found-or-unauthorized",
        "Employment record not found or unauthorized"
      );

    console.log(
      `[METHOD] tenantEmployment.update called for employment_id: ${employmentId}`,
      sanitizedUpdate
    );
    return await Ten_SettingsEmployment.updateAsync(
      { employment_id: employmentId },
      { $set: sanitizedUpdate }
    );
  },

  async "tenantEmployment.remove"(employmentId) {
    check(employmentId, String);

    const existing = await Ten_SettingsEmployment.findOneAsync({
      employment_id: employmentId,
      ten_id: this.userId
    });
    if (!existing)
      throw new Meteor.Error(
        "not-found-or-unauthorized",
        "Employment record not found or unauthorized"
      );

    console.log(
      `[METHOD] tenantEmployment.remove called for employment_id: ${employmentId}`
    );
    return await Ten_SettingsEmployment.removeAsync({
      employment_id: employmentId
    });
  },

  // tenant profile picture
  async "tenant.updateProfilePic"(url) {
    check(url, String);

    if (!this.userId) throw new Meteor.Error("not-authorized");

    const result = await Tenants.updateAsync(
      { ten_id: this.userId },
      { $set: { ten_pfp: url } }
    );

    return result;
  },

  // password change methods

  async "tenant.changePassword"({ currentPassword, newPassword }) {
    check(
      { currentPassword, newPassword },
      {
        currentPassword: String,
        newPassword: String
      }
    );

    if (!this.userId) throw new Meteor.Error("not-authorized");

    const user = await Meteor.users.findOneAsync(this.userId, {
      fields: {
        "services.password": 1
      }
    });

    if (!user) throw new Meteor.Error("user-not-found");

    // 2. Verify current password
    const passwordCheck = await Accounts._checkPasswordAsync(
      user,
      currentPassword
    );
    if (passwordCheck.error) throw new Meteor.Error("incorrect-password");

    // 4. Change password
    await Accounts.setPasswordAsync(this.userId, newPassword, {
      logout: false
    });

    return true;
  }
});
