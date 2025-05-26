import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';

export const TaskForm = () => {
  const [text, setText] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!text.trim()) return;

    Meteor.call('tasks.insert', text, isPrivate, (err) => {
      if (!err) {
        setText('');
        setIsPrivate(false); // reset
      } else {
        alert(err.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Type to add new tasks"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <label>
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={() => setIsPrivate(!isPrivate)}
        />
        {' '}Private
      </label>
      <button type="submit">Add Task</button>
    </form>
  );
};
