import React from 'react';
import {Task} from './task'; 

const tasks = [
  {_id: 1, text: 'Task Uno'},
  {_id: 2, text: 'Task Dos'},
  {_id: 3, text: 'Task Tres'},
 ];

export const App = () => (
  <div>
    <h1>Welcome to Meteor!</h1>
    <ul>
      {tasks.map(task => (
        <Task key={task._id} task={task} />
      ))}
    </ul>
  </div>
);
