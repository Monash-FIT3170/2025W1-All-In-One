import React from "react";
import { TasksCollection } from "../api/TasksCollection";

export const Task = ({ task }) => {
  const toggleChecked = () => {
    Meteor.callAsync("tasks.setChecked", task._id, !task.checked);
  };

  return (
    <li>
      <input
        type="checkbox"
        checked={!!task.checked}
        onChange={toggleChecked}
      />
      <span style={{ textDecoration: task.checked ? "line-through" : "none" }}>
        {task.text}
      </span>
    </li>
  );
};
