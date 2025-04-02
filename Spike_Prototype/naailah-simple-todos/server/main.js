import { Meteor } from 'meteor/meteor';
import { TasksCollection } from "/imports/api/TasksCollection";
import "../imports/api/Publications"; 
import "../imports/api/tasksMethods"; 

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