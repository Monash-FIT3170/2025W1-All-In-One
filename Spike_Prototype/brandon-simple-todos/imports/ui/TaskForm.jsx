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

        setText("");
    };

    return (
        
        <form className="task-form" onSubmit={handleSubmit}>
            <input 
                type="text" 
                class="input" 
                placeholder="Type to add new tasks"
                value={text}
                onChange={(e) => setText(e.target.value)}
                />

            <button type="submit" class="btn">Add Task</button>
        </form>
    );
};