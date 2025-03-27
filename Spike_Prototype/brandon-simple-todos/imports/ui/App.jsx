import React from 'react';
import { Task } from './Task.jsx';

const tasks = [
  {_id: 1, text: 'Task One - Install Meteor'},
  {_id: 2, text: 'Task Two - Setup Meteor "simple-todos"'},
  {_id: 3, text: 'Task Three - Create Tasks with Meteor App'},
  {_id: 4, text: 'Task Four - Setup Tailwind CSS'},
];

export const App = () => (
  <div>
    <h1>Welcome to Brandon's Todo List</h1>
    <ul>
      { tasks.map(task => <Task key={ tasks._id } task = { task }/>) }
      </ul>
  </div>
);
