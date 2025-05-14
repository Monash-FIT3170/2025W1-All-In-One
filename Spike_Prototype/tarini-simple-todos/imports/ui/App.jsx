import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { TasksCollection } from '/imports/api/TasksCollection';
import { Task } from './task'; 
import { TaskForm } from './TaskForm';
import { LoginForm } from './LoginForm';

export const App = () => {
  const user = useTracker(() => Meteor.user());

  const { tasks, isLoading } = useTracker(() => {
    const handler = Meteor.subscribe('tasks');

    if (!handler.ready()) {
      return { tasks: [], isLoading: true };
    }

    const tasks = TasksCollection.find({}, { sort: { createdAt: -1 } }).fetch();
    return { tasks, isLoading: false };
  }, []);

  const logout = () => Meteor.logout();

  if (!user) {
    return (
      <div>
        <h1>Welcome to Meteor!</h1>
        <LoginForm />
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome to Meteor!</h1>
      <button onClick={logout}>Log Out</button>
      <TaskForm />
      <ul>
        {tasks.map((task) => (
          <Task
            key={task._id}
            task={task}
            showPrivateButton={task.userId === user._id}
          />
        ))}
      </ul>
    </div>
  );
};
