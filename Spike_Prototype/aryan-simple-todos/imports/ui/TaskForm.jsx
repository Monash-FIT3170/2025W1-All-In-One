import React, { useState } from "react";
import { TasksCollection } from "/imports/api/TasksCollection";

export const TaskForm = () => {
    const [text, setText] = useState("");
    const [dueDate, setDueDate] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!text || !dueDate) return;

        await Meteor.callAsync("tasks.insert", {
            text: text.trim(),
            dueDate: new Date(dueDate),
            createdAt: new Date(),
        });

        setText("");
        setDueDate("");
    };

    return (
        <form className="task-form" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Type to add new tasks"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-half p-2 border border-gray-300 rounded text-gray-700 placeholder-gray-400 "
            />
            <span>       </span>
            <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-half p-2 border border-gray-300 rounded text-gray-700 ml-2"
            />
            <span>       </span>

            <button type="submit" className="mt-2 bg-blue-500 text-white p-2 rounded animate-pulse">Add Task</button>
        </form>
    );
};