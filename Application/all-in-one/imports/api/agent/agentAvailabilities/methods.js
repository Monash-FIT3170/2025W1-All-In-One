import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { AgentAvailabilities } from '/imports/api/database/collections';

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
    notes,
  ) {
    try {
      console.log('[DEBUG] insert args:', {
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
        notes
      });
  
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
      check(notes, Match.Optional(String));
  
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
        notes,
        createdAt: new Date(),
      });
  
      console.log(`[SERVER] Inserted availability ${result}`);
      return result;
  
    } catch (err) {
      console.error('[SERVER ERROR] agentAvailabilities.insert:', err);
      throw new Meteor.Error('insert-failed', err.message);
    }
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
  }

});
