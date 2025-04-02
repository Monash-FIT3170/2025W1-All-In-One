import React from "react";

export const Task = ({ task, onCheckboxClick, onDeleteClick }) => {
    
    return (
        <li>
            <input
                type="checkbox"
                class="checkbox"
                checked={!!task.isChecked}
                onClick={() => onCheckboxClick(task)}
                readOnly
            />
            <span>
                {task.text} 
                <button 
                    class="btn-delete" 
                    onClick={ () => onDeleteClick(task) }>
                        Delete
                </button>
            </span>
        </li>
    );
};