import { Meteor } from 'meteor/meteor';
import { TicketActivities } from '/imports/api/database/collections';

if (Meteor.isServer) {
  Meteor.publish('ticketActivities', function () {
    return TicketActivities.find({ agent_id: this.userId });
  });
}
