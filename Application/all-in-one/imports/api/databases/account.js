import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Tenants } from '../collections.js'; 

Meteor.methods({
  async registerUser({ email, password, firstName, lastName, role }) {
    try {
      // ✅ Create the Meteor account and await the user ID
      const userId = await Accounts.createUserAsync({
        email,
        password,
        profile: {
          role,
          firstName,
          lastName
        }
      });

      // ✅ Insert tenant data using userId as ten_id
      await Tenants.insertAsync({
        ten_id: userId,
        ten_fn: firstName,
        ten_ln: lastName,
        ten_email: email,
        ten_pn: '',         // optional: fill in from form later
        ten_pfp: '',
        ten_add: '',
        ten_role: role
      });

      return userId;
    } catch (error) {
      console.error("registerUser error:", error);
      throw new Meteor.Error("register-failed", error.message || "Something went wrong.");
    }
  }
});
