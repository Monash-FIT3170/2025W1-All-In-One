// ui/task.jsx
import React from 'react';
import { Meteor } from 'meteor/meteor';

export const Task = ({ task }) => {
  const isOwner = task.userId === Meteor.userId();

  const toggleChecked = () => {
    Meteor.call('tasks.setIsChecked', task._id, !task.isChecked);
  };

  const togglePrivate = () => {
    Meteor.call('tasks.setIsPrivate', task._id, !task.isPrivate);
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
      <span> ({task.username || 'anonymous'})</span>

      {isOwner && (
        <>
          <button onClick={togglePrivate}>
            {task.isPrivate ? 'Private' : 'Public'}
          </button>
          <button onClick={deleteTask}>❌</button>
        </>
      )}
    </li>
  );
};
