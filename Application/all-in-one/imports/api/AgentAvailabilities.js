import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';

export const AgentAvailabilities = new Mongo.Collection('agentAvailabilities');

if (Meteor.isServer) {
  Meteor.publish('agentAvailabilities', function () {
    return AgentAvailabilities.find();
  });
}

Meteor.methods({
  async 'agentAvailabilities.insert'(
    start,
    end,
    activity_type,
    availability_type,
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
    check(activity_type, String);
    check(availability_type, String);
    check(property, Object);
    check(price, Match.Optional(String));
    check(bedrooms, Match.Optional(String));
    check(bathrooms, Match.Optional(String));
    check(parking, Match.Optional(String)); 
    check(image, Match.Optional(String));
    check(status, Match.Optional(String));

    const result = await AgentAvailabilities.insertAsync({
      start,
      end,
      activity_type,
      availability_type,
      type: availability_type, 
      title: `${availability_type} Availability`, 
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

  async 'agentAvailabilities.markAsBooked'(availabilityId) {
    check(availabilityId, String);

    const result = await AgentAvailabilities.updateAsync(
      { _id: availabilityId },
      { $set: { status: 'booked' } }
    );

    if (result === 0) {
      throw new Meteor.Error('not-found', 'No matching availability found.');
    }

    return result;
  },

  async 'agentAvailabilities.clear'() {
    console.log('Clearing all availabilities...');
    return await AgentAvailabilities.removeAsync({});
  },

  async 'agentAvailabilities.update'(availabilityId, updateData) {
    check(availabilityId, String);
    check(updateData, Object);
    const result = await AgentAvailabilities.updateAsync(
      { _id: availabilityId },
      { $set: updateData }
    );
    if (result === 0) {
      throw new Meteor.Error('not-found', 'No matching availability found.');
    }
    return result;
  },
});
