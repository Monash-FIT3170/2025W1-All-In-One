import React from 'react';
import { Task } from './Task.jsx';

const tasks = [
 {_id: 1, text: 'Task Uno'},
 {_id: 2, text: 'Task Dos'},
 {_id: 3, text: 'Task Tres'},
];


export const App = () => (
 <div>
   <h1>Welcome to your TODO List!</h1>
   <ul>
     { tasks.map(task => <Task key={ task._id } task={ task }/>) } # These are the new changes.
   </ul>
 </div>
);
