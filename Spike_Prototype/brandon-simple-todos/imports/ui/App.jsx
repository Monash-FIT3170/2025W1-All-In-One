import React from 'react';
import { Task } from './Task';

const tasks = [
  {_id: 1, text: 'Task One - Install Meteor'},
  {_id: 2, text: 'Task Two - Setup Meteor "simple-todos"'},
  {_id: 3, text: 'Task Three - Create Tasks with Meteor App'},
  {_id: 4, text: 'Task Four - Setup Tailwind CSS'},
];

export const App = () => (
  <div>
    <h1 className="text-3xl text-red-600 font-bold underline">
      Welcome to Brandon's Todo List
      </h1>
    
    <body className="indent-4">
      <ul className="list-decimal list-inside text-l text-purple-600 italic">
        { tasks.map(task => <Task key={ tasks._id } task = { task }/>) }
      </ul>
    </body>

    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      I may be useless
    </button>

  </div>
);
