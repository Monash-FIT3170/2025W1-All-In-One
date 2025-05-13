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
  async 'inspectionAvailabilities.insert'(
    start,
    end,
    type,
    property,
    price,
    bedrooms,
    bathrooms,
    parking,
    image,
    status,
  ) {
    check(start, String);
    check(end, String);
    check(type, String);
    check(property, String);
    check(price, Match.Optional(String));
    check(bedrooms, Match.Optional(String));
    check(bathrooms, Match.Optional(String));
    check(parking, Match.Optional(String)); 
    check(image, Match.Optional(String));
    check(status, Match.Optional(String));

    const result = await InspectionAvailabilities.insertAsync({
      start,
      end,
      type,
      property,
      price,
      bedrooms,
      bathrooms,
      parking,
      image,
      status,
      createdAt: new Date(),
    });

    console.log(`[SERVER] Inserted availability ${result}`);
    return result;
  },

  async 'inspectionAvailabilities.clear'() {
    console.log('Clearing all availabilities...');
    return await InspectionAvailabilities.removeAsync({});
  }
});
