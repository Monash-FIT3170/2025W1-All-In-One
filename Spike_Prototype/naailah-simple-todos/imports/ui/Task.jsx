import React from "react";

export const Task = ({ task, onCheckboxClick, onDeleteClick }) => {
    return (
      <li className="task-item flex justify-between items-center">
        {/* Left-aligned checkbox and text */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={!!task.isChecked}
            onChange={() => onCheckboxClick(task)}
            className="task-checkbox"
          />
          <span className="task-text">{task.text}</span>
        </div>
  
        {/* Right-aligned delete button */}
        <button
          onClick={() => onDeleteClick(task)}
          className="task-delete bg-red-500 text-white px-2 py-1 rounded"
        >
          X
        </button>
      </li>
    );
  };