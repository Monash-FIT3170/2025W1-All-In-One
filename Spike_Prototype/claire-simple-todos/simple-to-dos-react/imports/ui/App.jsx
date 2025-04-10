import { Meteor } from 'meteor/meteor';
import React, { useState, Fragment } from 'react';
import { useTracker, useSubscribe } from 'meteor/react-meteor-data';
import { TasksCollection } from '/imports/api/TasksCollection';
import { Task } from './Task';
import { TaskForm } from './TaskForm';
import { LoginForm } from './LoginForm';

export const App = () => {

  const isLoading = useSubscribe("tasks");

  const user = useTracker(() => Meteor.user());
  
  const tasks = useTracker(() =>
    TasksCollection.find(
      {},
      { sort: { createdAt: 1 } }
    ).fetch()
  );
  
  const handleLogout = () => {
    Meteor.logout();
  };

  if (isLoading()) {
    return <div>Loading...</div>;
  }
  return (
    <div className="main">
        {user ? (
          <Fragment>
            <div className="header">
              <h1>Welcome, {user.username}!</h1>
              <button onClick={handleLogout}>Logout</button>
            </div>

            <ul className="tasks">
              {tasks.map(task => (
                <Task
                  key={task._id}
                  task={task}
                />
              ))}
            </ul>

            <div>
              <TaskForm />
            </div>

          </Fragment>
        ) : (
          <LoginForm />
        )}
    </div>
    
  );
};