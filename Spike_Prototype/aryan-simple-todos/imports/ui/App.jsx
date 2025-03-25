import React from 'react';
import { Task } from './Task';
import { Hello } from './Hello';

const tasks = [
  { _id: 1, text: 'Task Uno' },
  { _id: 2, text: 'Task Dos' },
  { _id: 3, text: 'Task Tres' },
];

export const App = () => (
  <div className="max-w-2xl mx-auto p-6">
    <Hello></Hello>
    <h2 className="text-2xl font-bold text-center text-gray-800 mt-6">
      📌 Todo List
    </h2>
    
    <ul className="mt-4 space-y-3">
      {tasks.map((task) => (
        <Task key={task._id} task={task} />
      ))}
    </ul>
  </div>
);