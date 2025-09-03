import { Meteor } from 'meteor/meteor';
import { AgentAvailabilities } from '/imports/api/database/collections';

if (Meteor.isServer) {
  Meteor.publish('agentAvailabilities', function () {
    // Only return availabilities for the current agent
    if (!this.userId) {
      return this.ready();
    }
    return AgentAvailabilities.find({ agent_id: this.userId });
  });

  // Publication for tenants to view ALL available inspection slots
  Meteor.publish('allAvailableInspections', function () {
    return AgentAvailabilities.find({
      activity_type: 'Availability',
      status: { $ne: 'booked' } // Only show unbooked slots
    });
  });

  Meteor.publish('allAvailabilities', function() {
    return AgentAvailabilities.find({
      activity_type: 'Availability',
    });
  })
}

