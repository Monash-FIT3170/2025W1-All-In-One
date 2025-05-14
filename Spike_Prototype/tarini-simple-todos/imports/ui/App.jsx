import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { TasksCollection } from '/imports/api/TasksCollection';
import { Task } from './task';
import { TaskForm } from './TaskForm';
import { LoginForm } from './LoginForm';

export const App = () => {
  const user = useTracker(() => Meteor.user());
  const [hideCompleted, setHideCompleted] = useState(false);

  const { tasks, isLoading } = useTracker(() => {
    const handler = Meteor.subscribe('tasks');
    if (!handler.ready()) {
      return { tasks: [], isLoading: true };
    }

    const filter = hideCompleted ? { isChecked: { $ne: true } } : {};
    const tasks = TasksCollection.find(filter, { sort: { createdAt: -1 } }).fetch();
    return { tasks, isLoading: false };
  }, [hideCompleted]);

  if (!user) {
    return (
      <div>
        <h1>Welcome to Meteor!</h1>
        <LoginForm />
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome to Meteor!</h1>
      <button onClick={() => Meteor.logout()}>Log Out</button>
      <TaskForm />
      <label>
        <input
          type="checkbox"
          checked={hideCompleted}
          onChange={() => setHideCompleted(!hideCompleted)}
        />
        Hide Completed Tasks
      </label>
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
