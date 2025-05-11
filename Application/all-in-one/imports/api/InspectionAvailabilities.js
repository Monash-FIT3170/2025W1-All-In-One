import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';

export const InspectionAvailabilities = new Mongo.Collection('inspectionAvailabilities');

if (Meteor.isServer) {
  Meteor.publish('inspectionAvailabilities', function () {
    return InspectionAvailabilities.find();
  });
}

Meteor.methods({
  async 'inspectionAvailabilities.insert'(start, end, type, property, tenant, notes) {
    check(start, String);
    check(end, String);
    check(type, String);
    check(property, String);
    check(tenant, String);
    check(notes, String);

    return InspectionAvailabilities.insertAsync({
      start,
      end,
      type,
      property,
      tenant,
      notes,
      createdAt: new Date(),
    });
  },

  async 'inspectionAvailabilities.clear'() {
    console.log('🧹 Clearing all availabilities...');
    return await InspectionAvailabilities.removeAsync({});
  }
});
