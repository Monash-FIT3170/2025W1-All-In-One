import React from 'react';
import { useTracker, useSubscribe } from 'meteor/react-meteor-data';
import { TasksCollection } from '../api/TasksCollection';
import { Task } from './task';
import { TaskForm } from './TaskForm';

export const App = () => {
  const isLoading = useSubscribe('tasks');
  const tasks = useTracker(() =>
    TasksCollection.find({}, { sort: { createdAt: -1 } }).fetch()
  );

  if (isLoading()) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome to Meteor!</h1>
      <TaskForm />
      <ul>
        {tasks.map((task) => (
          <Task key={task._id} task={task} />
        ))}
      </ul>
    </div>
  );
};
