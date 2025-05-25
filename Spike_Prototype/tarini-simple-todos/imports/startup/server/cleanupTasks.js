import { Meteor } from 'meteor/meteor';
import { TasksCollection } from '/imports/api/TasksCollection';

Meteor.startup(async () => {
  const malformedTasks = await TasksCollection.find({
    $or: [
      { text: { $exists: false } },
      { text: { $type: 'object' } },
      { text: { $not: { $type: 'string' } } },
    ],
  }).fetch();

  if (malformedTasks.length > 0) {
    console.log(`Cleaning up ${malformedTasks.length} malformed tasks...`);
    for (const task of malformedTasks) {
      await TasksCollection.removeAsync(task._id);
    }
  } else {
    console.log('No malformed tasks found.');
  }
});
