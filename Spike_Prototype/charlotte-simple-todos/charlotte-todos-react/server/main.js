import { Meteor } from 'meteor/meteor';
import { TasksCollection } from '/imports/api/TasksCollection';
import "../imports/api/publication"; // Importing the publication file to ensure the publication is set up
import "../imports/api/tasksMethods"; // Importing the methods file to ensure the methods are set up

const insertTask = (taskText) =>
  TasksCollection.insertAsync({ text: taskText });

Meteor.startup(async () => {
  if ((await TasksCollection.find().countAsync()) === 0) {
    [
      "Task Uno",
      "Task Dos",
      "Task Tres",
    ].forEach(insertTask);
  }
});