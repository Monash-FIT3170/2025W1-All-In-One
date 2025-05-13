import { Meteor } from 'meteor/meteor';
import { TasksCollection } from './TasksCollection';

Meteor.methods({
  'tasks.insert'(task) {
    return TasksCollection.insertAsync(task);
  },
});
