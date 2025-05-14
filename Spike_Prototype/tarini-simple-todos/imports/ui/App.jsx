import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { TasksCollection } from '/imports/api/TasksCollection';
import { Task } from './task'; 
import { TaskForm } from './TaskForm';
import { LoginForm } from './LoginForm';

export const App = () => {
  // Track the logged-in user
  const user = useTracker(() => Meteor.user());

  // Track the list of tasks
  const { tasks, isLoading } = useTracker(() => {
    const handler = Meteor.subscribe('tasks');

    if (!handler.ready()) {
      return { tasks: [], isLoading: true };
    }

    const tasks = TasksCollection.find({}, { sort: { createdAt: -1 } }).fetch();
    return { tasks, isLoading: false };
  }, []);

  // Show login form if user is not logged in
  if (!user) {
    return (
      <div>
        <h1>Welcome to Meteor!</h1>
        <LoginForm />
      </div>
    );
  }

  // Show loading state while waiting for subscription
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Main UI when logged in
  return (
    <div>
      <h1>Welcome to Meteor!</h1>
      <button onClick={() => Meteor.logout()}>Log Out</button>
      <TaskForm />
      <ul>
        {tasks.map((task) => (
          <Task key={task._id} task={task} />
        ))}
      </ul>
    </div>
  );
};
