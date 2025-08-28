import { Meteor } from 'meteor/meteor';
import { AgentAvailabilities } from '/imports/api/database/collections';

if (Meteor.isServer) {
  Meteor.publish('agentAvailabilities', function () {
    return AgentAvailabilities.find();
  });
   Meteor.publish('ticketActivities', function () {
    if (!this.userId) return this.ready();
    return TicketActivities.find({ agent_id: this.userId });
  });
}