import React, { useState } from "react";

export const TaskForm = () => {
  const [text, setText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text) return;

    await Meteor.callAsync("tasks.insert", {
      text: text.trim(),
      createdAt: new Date(),
    });

    setText(""); // clear input
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Add a task..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">Add Task</button>
    </form>
  );
};
