import { Meteor } from 'meteor/meteor';
import { TasksCollection } from "/imports/api/TasksCollection";
import "../imports/api/Publications"; 
import "../imports/api/tasksMethods"; 

const SEED_USERNAME = 'meteorite';
const SEED_PASSWORD = 'password';

const insertTask = (taskText) => TasksCollection.insertAsync({ text: taskText });

Meteor.startup(async () => {
  if ((await TasksCollection.find().countAsync()) === 0) {
    if (!(await Accounts.findUserByUsername(SEED_USERNAME))) {
      await Accounts.createUser({
        username: SEED_USERNAME,
        password: SEED_PASSWORD,
      });
    }

    [
      "Task Uno",
      "Task Dos",
      "Task Tres",
    ].forEach(insertTask);
  }
});