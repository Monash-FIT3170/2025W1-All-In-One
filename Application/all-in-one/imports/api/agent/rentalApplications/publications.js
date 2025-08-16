import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { RentalApplications, Incomes, Identities,SharedLeaseGroups} from '/imports/api/database/collections';
import '/imports/api/agent/rentalApplications/methods';

// Publish all rental applications (optionally add filters later)
Meteor.publish('rentalApplications', function () {
  return RentalApplications.find();
});

// Publish a single rental application by ID
Meteor.publish('rentalApplications.single', function (rentalAppId) {
  check(rentalAppId, String);
  return RentalApplications.find({ _id: rentalAppId });
});

// Publish all incomes (optionally add filters later)
Meteor.publish('incomes', function () {
  return Incomes.find();
});

// Publish all identities (optionally add filters later)
Meteor.publish('identities', function () {
  return Identities.find();
});

Meteor.publish('properties', function () {
  return Properties.find();
});

Meteor.publish('agents', function () {
  return Agents.find();
});

Meteor.publish('sharedLeaseGroups', function () {
  return SharedLeaseGroups.find();
});