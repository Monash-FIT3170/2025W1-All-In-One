import React from "react";

export const Task = ({ task, onCheckboxClick, onDeleteClick }) => {
    return (
        <li className="task-box">
            <div className="flex items-center">
                <input
                    type="checkbox"
                    checked={!!task.isChecked}
                    onChange={() => onCheckboxClick(task)}
                    className="mr-2 accent-blue-500 cursor-pointer"
                />
                <span className={`task-text ${task.isChecked ? "line-through text-gray-500" : ""}`}>
                    {task.text}
                </span>
            </div>
            <div className="flex items-center">
              <span></span>
                <span className="text-sm text-gray-500 mr-4">
                    Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                </span>
                <button
                    onClick={() => onDeleteClick(task)}
                    className="text-red-500 hover:text-red-700"
                >
                    Delete
                </button>
            </div>
        </li>
    );
};