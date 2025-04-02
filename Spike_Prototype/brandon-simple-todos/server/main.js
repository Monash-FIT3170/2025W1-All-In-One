import { Meteor } from 'meteor/meteor';
import { TasksCollection } from '/imports/api/TasksCollection';
import "../imports/api/TasksPublications"; 
import { Task } from '../imports/ui/Task';
import "../imports/api/tasksMethods"

const insertTask = (taskText) => 
  TasksCollection.insertAsync({ text: taskText });

Meteor.startup(async () => {
  if ((await TasksCollection.find().countAsync()) === 0) {
    [
    'Task One - Install Meteor',
    'Task Two - Setup Meteor "simple-todos"',
    'Task Three - Create Tasks',
    'Task Four - Setup Tailwind CSS',
    'Task Five - Customise Meteor App',
    'Task Six - Make a Collection',
    'Task Seven - Make a Form',
    ].forEach(insertTask);
  }
});