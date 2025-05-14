import React from 'react';
import { Meteor } from 'meteor/meteor';
import { TasksCollection } from '/imports/api/TasksCollection';

export const Task = ({ task }) => {
  const toggleChecked = () => {
    Meteor.call('tasks.setIsChecked', task._id, !task.isChecked);
  };

  const deleteTask = () => {
    Meteor.call('tasks.remove', task._id);
  };

  return (
    <li>
      <input
        type="checkbox"
        readOnly
        checked={!!task.isChecked}
        onClick={toggleChecked}
      />
      <span style={{ textDecoration: task.isChecked ? 'line-through' : 'none' }}>
        {task.text}
      </span>
      <button onClick={deleteTask} style={{ marginLeft: '10px' }}>
        ❌
      </button>
    </li>
  );
};
