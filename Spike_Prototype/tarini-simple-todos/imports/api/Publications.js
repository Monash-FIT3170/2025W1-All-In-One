import { Meteor } from 'meteor/meteor';
import { TasksCollection } from './TasksCollection';

Meteor.publish('tasks', function () {
  return TasksCollection.find();
});
