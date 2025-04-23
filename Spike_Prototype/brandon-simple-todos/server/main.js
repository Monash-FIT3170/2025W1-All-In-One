import { Meteor } from 'meteor/meteor';
import { Accounts } from "meteor/accounts-base";
import { TasksCollection } from '/imports/api/TasksCollection';
import "../imports/api/TasksPublications"; 
import { Task } from '../imports/ui/Task';
import "../imports/api/tasksMethods"

const insertTask = (taskText) => 
  TasksCollection.insertAsync({ 
    text: taskText,
    userId: user._id,
    createdAt: new Date(),
  });

const SEED_USERNAME = 'meteorite';
const SEED_PASSWORD = 'password';

Meteor.startup(async () => {
  if (!(await Accounts.findUserByUsername(SEED_USERNAME))) {
    await Accounts.createUser({
      username: SEED_USERNAME,
      password: SEED_PASSWORD,
    });
  }

  const user = await Accounts.findUserByUsername(SEED_USERNAME);

  if ((await TasksCollection.find().countAsync()) === 0) {
    [
    'Task One - Install Meteor',
    'Task Two - Setup Meteor "simple-todos"',
    'Task Three - Create Tasks',
    'Task Four - Setup Tailwind CSS',
    'Task Five - Customise Meteor App',
    'Task Six - Make a Collection',
    'Task Seven - Make a Form',
    ].forEach((taskText) => insertTask(taskText, user));
  }
});