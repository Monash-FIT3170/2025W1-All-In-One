// imports/api/TasksCollection.js
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export const TasksCollection = new Mongo.Collection('tasks');

if (Meteor.isServer) {
  Meteor.publish('tasks', function publishTasks() {
    return TasksCollection.find({
      $or: [
        { userId: this.userId },
        { isPrivate: { $ne: true } },
      ],
    });
  });
  console.log('✅ TasksCollection.js loaded on server');
}

Meteor.methods({
  async 'tasks.insert'(text, isPrivate) {
    check(text, String);
    check(isPrivate, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized');
    }

    await TasksCollection.insertAsync({
      text,
      createdAt: new Date(),
      userId: this.userId,
      isPrivate,
    });
  },

  async 'tasks.remove'(taskId) {
    check(taskId, String);

    const task = await TasksCollection.findOneAsync(taskId);
    if (task.isPrivate && task.userId !== this.userId) {
      throw new Meteor.Error('Not authorized to delete this task');
    }

    await TasksCollection.removeAsync(taskId);
  },

  async 'tasks.setIsChecked'(taskId, isChecked) {
    check(taskId, String);
    check(isChecked, Boolean);

    const task = await TasksCollection.findOneAsync(taskId);
    if (task.isPrivate && task.userId !== this.userId) {
      throw new Meteor.Error('Not authorized to check this task');
    }

    await TasksCollection.updateAsync(taskId, {
      $set: { isChecked },
    });
  },

  async 'tasks.setIsPrivate'(taskId, isPrivate) {
    check(taskId, String);
    check(isPrivate, Boolean);

    const task = await TasksCollection.findOneAsync(taskId);
    if (task.userId !== this.userId) {
      throw new Meteor.Error('Not authorized to change privacy');
    }

    await TasksCollection.updateAsync(taskId, {
      $set: { isPrivate },
    });
  },
});
