import { Meteor } from 'meteor/meteor';
import {
  Properties,
  Tenants,
  RentalApplications,
  Photos,
  Videos,
  Leaseholders,
  Employment,
  Addresses,
  Incomes,
  Identities,
  Households,
  Agents
} from '/imports/api/collections';
import '/imports/api/methods/account.js';
import './roles.js';  // Import our roles system
// import { assignUserRole, ROLES } from './roles';

Meteor.startup(async () => {
  // Initialize all collections with publications
  Meteor.publish('properties', function () {
    return Properties.find();
  });

  Meteor.publish('tenants', function () {
    return Tenants.find();
  });

  Meteor.publish('rentalApplications', function () {
    return RentalApplications.find();
  });

  Meteor.publish('photos', function () {
    return Photos.find();
  });

  Meteor.publish('videos', function () {
    return Videos.find();
  });

  Meteor.publish('leaseholders', function () {
    return Leaseholders.find();
  });

  Meteor.publish('employment', function () {
    return Employment.find();
  });

  Meteor.publish('addresses', function () {
    return Addresses.find();
  });

  Meteor.publish('incomes', function () {
    return Incomes.find();
  });

  Meteor.publish('identities', function () {
    return Identities.find();
  });

  Meteor.publish('households', function () {
    return Households.find();
  });

  Meteor.publish('agents', function () {
    return Agents.find();
  });
});