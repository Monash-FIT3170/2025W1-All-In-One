import { Meteor } from 'meteor/meteor';
import React, { useState, Fragment } from 'react';
import { useTracker, useSubscribe } from 'meteor/react-meteor-data';
import { TasksCollection } from "/imports/api/TasksCollection";
import { Task } from './Task';
import { TaskForm } from './TaskForm';
import { LoginForm } from './LoginForm';

/*
const tasks = [
  {_id: 1, text: 'Task One - Install Meteor'},
  {_id: 2, text: 'Task Two - Setup Meteor "simple-todos"'},
  {_id: 3, text: 'Task Three - Create Tasks with Meteor App'},
  {_id: 4, text: 'Task Four - Setup Tailwind CSS'},
];
*/

export const App = () => {

  const user = useTracker(() => Meteor.user());
  
  const [hideCompleted, setHideCompleted] = useState(false);

  const isLoading = useSubscribe("tasks");

  const hideCompletedFilter = { isChecked: { $ne: true } };

  const tasks = useTracker(() =>{
    if (!user) {
      return [];
    }

    return TasksCollection.find(
      hideCompleted ? hideCompletedFilter : {},
      {
      sort: { createdAt: 1 },
      }
    ).fetch();
  });
  
  const pendingTasksCount = useTracker(() => {
    if (!user) { 
      return 0;
    }
    
    return TasksCollection.find(hideCompletedFilter).count();
  });

  const pendingTasksTitle = `${
    pendingTasksCount ? ` (${pendingTasksCount})` : ''
  }`;

  const handleToggleChecked = ({ _id, isChecked }) =>
    Meteor.callAsync("tasks.toggleChecked",  {_id, isChecked });

  const handleDelete = ({ _id }) => 
    Meteor.callAsync("tasks.delete", { _id });

  if (isLoading()) {
    return<div>Loading Tasks...</div>
  };

  const logout = () => Meteor.logout();

  return(
    <div>
      <h1 class="heading1">
        Brandon's Todo List 
        {pendingTasksTitle}
      </h1>

      <div className='main'>
        {user ? (
          <Fragment>
            <div className='user' onClick={logout}>
              {user.username} 🚪
            </div>
            
            <div className="filter">
              <button onClick={ () => setHideCompleted(!hideCompleted)}>
            {hideCompleted ? 'Show All' : 'Hide Completed'}
          </button>
      </div>

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
        <TaskForm />
      </div>

          </Fragment>
        ) : (
          <LoginForm />
        )}
      </div>
  </div>
  );
};