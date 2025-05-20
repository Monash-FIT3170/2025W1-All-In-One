import { Meteor } from 'meteor/meteor';
import { RentalApplications, Incomes } from '/imports/api/database/collections';
import '/imports/api/rentalApplications/methods';

Meteor.publish('rentalApplications', function () {
  // Return all rental applications (you can filter by user or other criteria here)
  return RentalApplications.find();
});

Meteor.publish('incomes', function () {
  // Return all income documents (again, add filtering if needed)
  return Incomes.find();
});
