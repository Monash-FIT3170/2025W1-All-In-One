// File: server/methods.js (or imports/api/users/methods.js and import in server/main.js)
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base'; // For password hashing and comparison
import { Tenants } from '../imports/api/collections'; // Adjust path to your collections file
// You might also need Agents if they can log in too:
// import { Agents } from '../imports/api/collections';

// It's crucial to install bcrypt for password hashing:
// meteor npm install bcrypt
import bcrypt from 'bcrypt';

Meteor.methods({
  async 'users.signup'(tenantData) {
    // Validate tenantData against Tenants.schema if you want strict validation
    // new SimpleSchema(Tenants.schema).validate(tenantData) // Example, might need to adjust fields

    // Check if email already exists
    const existingTenant = Tenants.findOne({ ten_email: tenantData.ten_email });
    if (existingTenant) {
      throw new Meteor.Error('email-exists', 'Email already registered.');
    }

    // **SECURITY: Hash the password**
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(tenantData.ten_password, saltRounds);

    const newTenant = {
      ...tenantData,
      ten_password: hashedPassword, // Store the hashed password
      createdAt: new Date(),
    };

    try {
      const tenantId = Tenants.insert(newTenant);
      console.log('New tenant created with ID:', tenantId);
      return { success: true, tenantId };
    } catch (error) {
      console.error("Error creating tenant:", error);
      throw new Meteor.Error('signup-failed', 'Could not create account.');
    }
  },

  async 'users.login'({ email, password }) {
    const tenant = Tenants.findOne({ ten_email: email });

    if (!tenant) {
      throw new Meteor.Error('user-not-found', 'User not found.');
    }

    // **SECURITY: Compare hashed password**
    const passwordsMatch = await bcrypt.compare(password, tenant.ten_password);

    if (!passwordsMatch) {
      throw new Meteor.Error('incorrect-password', 'Incorrect password.');
    }

    // IMPORTANT: If you want to integrate with Meteor's user session system
    // (so Meteor.userId() and Meteor.user() work on the client),
    // this custom login is NOT enough. You would typically use Meteor.loginWithPassword
    // which expects users in the Meteor.users collection.
    //
    // For a purely custom system that doesn't use Meteor's accounts-base for sessions:
    // You'd need to generate and manage your own session tokens here.
    // This example simply confirms credentials.
    //
    // To make this method log the user into the Meteor system (requires user in Meteor.users):
    // You would usually find the user in Meteor.users. If you are trying to log in
    // a 'Tenant' as a Meteor user, the 'Tenant' would need an equivalent Meteor.users entry.
    //
    // For this custom approach, we'll just return some user info.
    // To make Meteor.userId() work on the client after this, you'd do:
    // this.setUserId(tenant._id); // This logs in the user *in the Meteor sense* for this connection.
    // However, this assumes tenant._id is what you want to use as the Meteor userId.

    console.log('Tenant login successful:', tenant.ten_fn);
    // this.setUserId(tenant._id); // Example: if you want to set Meteor's userId
    return {
      success: true,
      userId: tenant._id, // Or tenant.ten_id
      firstName: tenant.ten_fn,
      email: tenant.ten_email,
      role: tenant.ten_role,
    };
  },
});

// Ensure you import this methods file in your server's main entry point
// e.g., in server/main.js:
// import '../imports/api/users/methods'; // or './methods' if in the server folder directly