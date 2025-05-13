import { Meteor } from 'meteor/meteor';
import { TasksCollection } from '/imports/api/TasksCollection';
import '/imports/api/Publications';
import '/imports/api/tasksMethods';


Meteor.startup(async () => {
  const taskCount = await TasksCollection.find().countAsync();

  if (taskCount === 0) {
    const tasks = ['Task Uno', 'Task Dos', 'Task Tres'];

    for (const text of tasks) {
      await TasksCollection.insertAsync({
        text,
        createdAt: new Date(),
      });
    }
  }
});
