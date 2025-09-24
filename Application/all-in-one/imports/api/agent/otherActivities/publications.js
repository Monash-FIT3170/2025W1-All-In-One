import { Meteor } from 'meteor/meteor';
import { OtherActivities } from '/imports/api/database/collections';

if (Meteor.isServer) {
  Meteor.publish('agentOtherActivities', function () {
    // Only return other activities for the current agent
    if (!this.userId) {
      return this.ready();
    }
    return OtherActivities.find({ agent_id: this.userId });
    });
  }