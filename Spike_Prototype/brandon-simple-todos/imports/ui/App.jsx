import React, { useState } from 'react';
import { useTracker, useSubscribe } from 'meteor/react-meteor-data';
import { TasksCollection } from "/imports/api/TasksCollection";
import { Task } from './Task';
import { TaskForm } from './TaskForm'
import { Meteor } from 'meteor/meteor';
/*
const tasks = [
  {_id: 1, text: 'Task One - Install Meteor'},
  {_id: 2, text: 'Task Two - Setup Meteor "simple-todos"'},
  {_id: 3, text: 'Task Three - Create Tasks with Meteor App'},
  {_id: 4, text: 'Task Four - Setup Tailwind CSS'},
];
*/

export const App = () => {
  
  const [hideCompleted, setHideCompleted] = useState(false);

  const isLoading = useSubscribe("tasks");

  const hideCompletedFilter = { isChecked: { $ne: true } };

  const tasks = useTracker(() =>
    TasksCollection.find(hideCompleted ? hideCompletedFilter : {}, {
      sort: { createdAt: 1 },
    }).fetch()
  );

  const handleToggleChecked = ({ _id, isChecked }) =>
    Meteor.callAsync("tasks.toggleChecked",  {_id, isChecked });

  const handleDelete = ({ _id }) => 
    Meteor.callAsync("tasks.delete", { _id });
  
  

  if (isLoading()) {
    return<div>Loading Tasks...</div>
  };

  return(
    <div>
      <h1 class="heading1">
        Welcome to Brandon's Todo List
      </h1>

      <body>
        <ul class="list">
          {tasks.map((task) =>
            <Task 
              key={ task._id } 
              task = { task } 
              onCheckboxClick={handleToggleChecked}
              onDeleteClick={handleDelete}
            />
          )}
        </ul>
      </body>

      <div>
        <div className="filter">
          <button onClick={ () => setHideCompleted(!hideCompleted)}>
            {hideCompleted ? 'Show All' : 'Hide Completed'}
          </button>
        </div>
        <TaskForm />
      </div>

  </div>
  );
};