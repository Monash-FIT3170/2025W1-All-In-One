
import { Meteor } from 'meteor/meteor';
import React, { useState, Fragment } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { TasksCollection } from '/imports/api/TasksCollection';
import { Task } from './Task';
import { TaskForm } from './TaskForm';
import { LoginForm } from './LoginForm';


export const App = () => {
  const [showTasks, setShowTasks] = useState(false);

  // Subscribe to the tasks publication
  const tasks = useTracker(() => {
    const handler = Meteor.subscribe('tasks');
    if (!handler.ready()) {
      return []; // Return an empty array while loading
    }
    return TasksCollection.find({}, { sort: { createdAt: -1 } }).fetch();
  });

  const handleRocketClick = () => {
    setShowTasks(true);
  };

  const handleToggleChecked = ({ _id, isChecked }) =>
    Meteor.callAsync('tasks.toggleChecked', { _id, isChecked });

  const handleDelete = ({ _id }) =>
    Meteor.callAsync('tasks.delete', { _id });

  const user = useTracker(() => Meteor.user());

  const logout = () => Meteor.logout();

  if (!tasks) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app-container">
      {user ? (
        <Fragment>
          <div className="user" onClick={logout}>
            {user.username} 🚪
          </div>
          {/* Text Transition Section */}
          <div className="relative h-16">
            {!showTasks ? (
              <h1 className="text-transition">Welcome!</h1>
            ) : (
              <h1 className="text-transition">☑️ Your Tasks!</h1>
            )}
          </div>

          {/* Rocket Button */}
          {!showTasks && (
            <div className="transition-all duration-700 opacity-100 h-auto">
              <p className="mt-2 text-lg text-gray-200">Click the rocket to see your tasks.</p>
              <button onClick={handleRocketClick} className="rocket-button">
                🚀
              </button>
            </div>
          )}

          {/* Task Form */}
          <div
            className={`task-form-container transition-all duration-700 ${showTasks ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
          >
            {showTasks && <TaskForm />}
          </div>

          {/* Tasks Section */}
          <div
            className={`tasks-section transition-all duration-700 ${showTasks ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
          >
            {showTasks && (
              <ul className="space-y-3">
                {tasks.map((task) => (
                  <Task
                    key={task._id}
                    task={task}
                    onCheckboxClick={handleToggleChecked}
                    onDeleteClick={handleDelete}
                  />
                ))}
              </ul>
            )}
          </div>
        </Fragment>
      ) : (
        <LoginForm />
      )}
    </div>
  );
};