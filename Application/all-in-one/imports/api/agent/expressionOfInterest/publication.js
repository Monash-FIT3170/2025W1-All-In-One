import { Meteor } from 'meteor/meteor';
import { ExpressionOfInterest } from '../../database/collections';

if (Meteor.isServer) {
  Meteor.publish('expressionOfInterest', function () {
    return ExpressionOfInterest.find();
});
}