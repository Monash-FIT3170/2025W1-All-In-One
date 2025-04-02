import React, { useState } from 'react';
import { Task } from './Task';

export const Hello = ({ tasks }) => {
  const [showTasks, setShowTasks] = useState(false);

  const handleRocketClick = () => {
    setShowTasks(true);
  };

  return (
    <div className={`w-full h-35 ${showTasks ? 'h-auto' : ''} bg-gradient-to-r from-blue-400 to-purple-600 text-white py-6 text-center shadow-lg transition-all duration-700`}>
      <div
        className={`transition-opacity duration-700  ${showTasks ? 'opacity-0' : ''
          }`}
      >
        <h1 className="text-3xl font-extrabold drop-shadow-lg">
          Welcome!
        </h1>
        <p className="mt-2 text-lg text-gray-200">
          Click the rocket to see your tasks.
        </p>
        <div
          className='animate-bounce'
        >
          <button onClick={handleRocketClick} className="cursor-pointer drop-shadow-lg">

            🚀
          </button>
        </div>
      </div>
      <div className={`transition-opacity duration-700 ${showTasks ? 'opacity-100' : 'opacity-0'}`}>
        <div>
        <h1 className={`text-3xl font-extrabold drop-shadow-lg ${showTasks ? 'opacity-100' : 'opacity-0'
          }`}>
          Your Tasks
        </h1>
      </div>
      {showTasks && (
        <div className="mt-6">
          <ul className="mt-4 space-y-3">
            {tasks.map((task) => (
              <Task key={task._id} task={task} />
            ))}
          </ul>
        </div>
      )}
      </div>
    </div>
  );
};