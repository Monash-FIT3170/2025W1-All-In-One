import React from "react";
import { useTracker, useSubscribe } from 'meteor/react-meteor-data'; 
import { TasksCollection } from "/imports/api/TasksCollection";
import { Task } from "./Task";
import { TaskForm } from "./TaskForm";
import { LoginForm } from './LoginForm';

export const App = () => {
 const user = useTracker(() => Meteor.user());
 const isLoading = useSubscribe("tasks"); 
 const tasks = useTracker(() => TasksCollection.find({}, { sort: { createdAt: -1 } }).fetch());

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
              {tasks.map(task => (
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