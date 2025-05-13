import { Meteor } from 'meteor/meteor';
import { TasksCollection } from './TasksCollection';

Meteor.methods({
  'tasks.insert'(task) {
    return TasksCollection.insertAsync(task);
  },

  'tasks.setChecked'(taskId, setChecked) {
    return TasksCollection.updateAsync(taskId, {
      $set: { checked: setChecked },
    });
  },

  'tasks.remove'(taskId) {
    return TasksCollection.removeAsync(taskId);
  },
});


