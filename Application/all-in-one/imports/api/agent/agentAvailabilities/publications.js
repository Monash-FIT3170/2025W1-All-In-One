import { Meteor } from 'meteor/meteor';
import { AgentAvailabilities } from '/imports/api/database/collections';

if (Meteor.isServer) {
  Meteor.publish('agentAvailabilities', function () {
    return AgentAvailabilities.find();
  });
}