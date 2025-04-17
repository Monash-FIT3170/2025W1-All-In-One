import React from "react";
import { useTracker, useSubscribe } from 'meteor/react-meteor-data'; 
import { useState, Fragment } from 'react';
import { TasksCollection } from "/imports/api/TasksCollection";
import { Task } from "./Task";
import { TaskForm } from "./TaskForm";
import { LoginForm } from "./LoginForm";

export const App = () => {
 const user = useTracker(() => Meteor.user());
 const isLoading = useSubscribe("tasks"); 
 const tasks = useTracker(() => TasksCollection.find({}, { sort: { createdAt: -1 } }).fetch());
 const [hideCompleted, setHideCompleted] = useState(false);
 const handleToggleChecked = (_id, isChecked) => {
  Meteor.call("tasks.toggleChecked", _id, !isChecked);
 };
 const handleDelete = (_id) => {
  Meteor.call("tasks.delete", _id);
 };

 const filteredTasks = hideCompleted
  ? tasks.filter(task => !task.isChecked)
  : tasks;

  if (isLoading()) {
    return <div>Loading...</div>;
  }
  return (
    <div className="main">
      {user ? (
        <Fragment>
          <TaskForm />

          <div className="filter">
            <button onClick={() => setHideCompleted(!hideCompleted)}>
              {hideCompleted ? 'Show All' : 'Hide Completed'}
            </button>
          </div>

          <ul className="tasks">
            {filteredTasks.map(task => (
              <Task
                key={task._id}
                task={task}
                onCheckboxClick={handleToggleChecked}
                onDeleteClick={handleDelete}
              />
            ))}
          </ul>
        </Fragment>
      ) : (
        <LoginForm />
      )}
    </div>
  );
};