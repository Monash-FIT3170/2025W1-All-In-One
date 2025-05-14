import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { TasksCollection } from '/imports/api/TasksCollection';
import '/imports/api/Publications';
import '/imports/startup/server/cleanupTasks';


Meteor.startup(async () => {
  const SEED_USERNAME = 'meteorite';
  const SEED_PASSWORD = 'password';

  if (!(await Accounts.findUserByUsername(SEED_USERNAME))) {
    await Accounts.createUser({
      username: SEED_USERNAME,
      password: SEED_PASSWORD,
    });
  }

  const count = await TasksCollection.find().countAsync();
  if (count === 0) {
    const sampleTasks = ['Task Uno', 'Task Dos', 'Task Tres'];
    for (const text of sampleTasks) {
      await TasksCollection.insertAsync({
        text,
        createdAt: new Date(),
        userId: Accounts.findUserByUsername(SEED_USERNAME)._id,
      });
    }
  }
});

