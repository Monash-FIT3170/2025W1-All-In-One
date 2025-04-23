import { Meteor } from 'meteor/meteor';
import React, { useState, Fragment } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { TasksCollection } from '/imports/api/TasksCollection';
import { Task } from './Task';
import { TaskForm } from './TaskForm';
import { LoginForm } from './LoginForm';
import { Calendar } from './Calendar';


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
            Log out 👋
          </div>
          {/* Text Transition Section */}
          <div className="relative h-16">
            {!showTasks ? (
              <h1 className="text-transition">Welcome!</h1>
            ) : (
              <h1 className="text-transition">Your todo list!</h1>
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

          {/* Main Layout */}
          {showTasks && (
            <div className="transition-all duration-700 opacity-100 h-auto">
              <div className="main-container">
                {/* Tasks Section (Left) */}
                <div className="tasks-container flex-1 p-4 rounded shadow-lg">
                  <h2 className="text-xl font-bold mb-4">All Tasks</h2>
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

                {/* Calendar Section (Right) */}
                <div className="calendar-container flex-1 p-4 rounded shadow-lg">
                  {showTasks && <Calendar tasks={tasks} />}
                </div>
              </div>
              <div className="task-form-container mt-6">
                <h2 className="text-xl font-bold mb-2">Add a Task</h2>
                {/* Task Form */}
                <TaskForm />
              </div>
            </div>
          )}
        </Fragment>
      ) : (
        <LoginForm />
      )}
    </div>
  );
};