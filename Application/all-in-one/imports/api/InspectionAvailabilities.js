import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export const InspectionAvailabilities = new Mongo.Collection('inspectionAvailabilities');

if (Meteor.isServer) {
  Meteor.publish('inspectionAvailabilities', function () {
    return InspectionAvailabilities.find();
  });
}

Meteor.methods({
  async 'inspectionAvailabilities.insert'(start, end) {
    check(start, String);
    check(end, String);
    console.log('Inserting availability:', start, end);
    return InspectionAvailabilities.insertAsync({
      start,
      end,
      createdAt: new Date(),
    });
  },

  async 'inspectionAvailabilities.clear'() {
    console.log('Clearing all availabilities...');
    return await InspectionAvailabilities.removeAsync({});
  }
  
});
