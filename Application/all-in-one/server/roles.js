import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';

// Define our main roles
const ROLES = {
  ADMIN: 'admin',
  TENANT: 'tenant',
  LANDLORD: 'landlord',
  AGENT: 'agent'
};

// Initialize roles on server startup
Meteor.startup(async () => {
  // Create roles if they don't exist
  for (const role of Object.values(ROLES)) {
    await Roles.createRoleAsync(role, { unlessExists: true });
  }

  // Set up role hierarchy if needed
  // For now, we'll keep it flat but we can add hierarchy later
  // Example: Roles.addRolesToParentAsync('agent', 'landlord');
});

// Helper function to assign roles to a user
export const assignUserRole = async (userId, role) => {
  if (!Object.values(ROLES).includes(role)) {
    throw new Meteor.Error('invalid-role', 'Invalid role specified');
  }
  await Roles.addUsersToRolesAsync(userId, role);
};

// Helper function to check if a user has a specific role
export const userHasRole = async (userId, role) => {
  if (!Object.values(ROLES).includes(role)) {
    throw new Meteor.Error('invalid-role', 'Invalid role specified');
  }
  return await Roles.userIsInRoleAsync(userId, role);
};

// Export roles for use in other files
export { ROLES };

// Publish role assignments to the client
Meteor.publish(null, function () {
  if (this.userId) {
    return Meteor.roleAssignment.find({ 'user._id': this.userId });
  }
  return this.ready();
});

// Add a method to check role assignments
Meteor.methods({
  'roles.getAssignments'() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'Must be logged in');
    }
    
    // Only allow admins to see all role assignments
    if (!Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error('not-authorized', 'Must be an admin');
    }

    return Meteor.roleAssignment.find().fetch();
  }
}); 