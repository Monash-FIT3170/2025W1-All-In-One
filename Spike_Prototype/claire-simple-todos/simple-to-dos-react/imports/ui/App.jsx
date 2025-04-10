import React from "react";
import { useTracker, useSubscribe } from 'meteor/react-meteor-data'; 
import { TasksCollection } from "/imports/api/TasksCollection";
import { Task } from "./Task";

// Render the tasks - add tasks and publication
export const App = () => {
 const isLoading = useSubscribe("tasks"); 
  const tasks = useTracker(() => TasksCollection.find({}).fetch()); //gets all tasks from the MongoDB collection

  return (
    <div>
      <h1>Welcome to your TODO list!</h1>

      <ul>
        {tasks.map((task) => (
          <Task key={task._id} task={task} />
        ))}
      </ul>
    </div>
  );
};

