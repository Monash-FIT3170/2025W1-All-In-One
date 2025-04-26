import React, { useState } from "react";

export const Calendar = ({ tasks }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null); // State to track the selected date
    const [tasksForSelectedDate, setTasksForSelectedDate] = useState([]); // State to store tasks for the selected date

    // Get the start and end of the current week (starting on Monday)
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = currentDate.getDay();
    const daysToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    startOfWeek.setDate(currentDate.getDate() + daysToMonday);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // Generate an array of days for the current week
    const days = Array.from({ length: 7 }).map((_, index) => {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + index);
        return day;
    });

    // Navigate to the previous week
    const handlePrevWeek = () => {
        const prevWeek = new Date(currentDate);
        prevWeek.setDate(currentDate.getDate() - 7);
        setCurrentDate(prevWeek);
    };

    // Navigate to the next week
    const handleNextWeek = () => {
        const nextWeek = new Date(currentDate);
        nextWeek.setDate(currentDate.getDate() + 7);
        setCurrentDate(nextWeek);
    };

    // Handle showing or hiding tasks for a specific date
    const handleViewTasksClick = (date) => {
        if (selectedDate && selectedDate.toDateString() === date.toDateString()) {
            // If the same date is clicked again, toggle off the task list
            setSelectedDate(null);
            setTasksForSelectedDate([]);
        } else {
            // Otherwise, show tasks for the selected date
            setSelectedDate(date);
            const filteredTasks = tasks.filter((task) => {
                const taskDate = new Date(task.dueDate).toDateString();
                const calendarDate = date.toDateString();
                return taskDate === calendarDate;
            });
            setTasksForSelectedDate(filteredTasks);
        }
    };

    return (
        <div className="calendar-container">
            <div className="flex justify-around items-center mb-4">
                <button onClick={handlePrevWeek} className="bg-blue-500 px-2 py-1 rounded">
                    &lt; Prev Week
                </button>
                <h2 className="text-center text-xl font-bold">
                    Week of ({startOfWeek.toLocaleDateString()} - {endOfWeek.toLocaleDateString()})
                </h2>
                <button onClick={handleNextWeek} className="bg-blue-500 px-2 py-1 rounded">
                    Next Week &gt;
                </button>
            </div>
            <div className="calendar-grid grid grid-cols-7 gap-2">
                {/* Weekday headers */}
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <div key={day} className="calendar-header font-bold text-center">
                        {day}
                    </div>
                ))}
                {/* Calendar days */}
                {days.map((day, index) => {
                    const hasTask = tasks.some((task) => {
                        const taskDate = new Date(task.dueDate).toDateString();
                        const calendarDate = day.toDateString();
                        return taskDate === calendarDate;
                    });

                    return (
                        <div
                            key={index}
                            className={`calendar-day border p-2 text-center rounded ${hasTask ? "bg-blue-100 text-blue-600 font-bold" : "text-gray-700"
                                }`}
                        >
                            <div>{day.getDate()}</div>
                            <div>
                                <button
                                    onClick={() => handleViewTasksClick(day)}
                                    className={`px-2 py-1 rounded mt-2 ${selectedDate && selectedDate.toDateString() === day.toDateString()
                                            ? "bg-red-500 text-white"
                                            : "bg-green-500 text-white"
                                        }`}
                                >
                                    {selectedDate && selectedDate.toDateString() === day.toDateString()
                                        ? "Close Tasks"
                                        : "View Tasks"}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            {selectedDate && (
                <div className="tasks-modal p-4 rounded shadow-lg mt-4">
                    <h3 className="text-xl font-bold">
                        Tasks for {selectedDate.toDateString()}:
                    </h3>
                    {tasksForSelectedDate.length > 0 ? (
                        <ul className="mt-2 space-y-2">
                            {tasksForSelectedDate.map((task, index) => (
                                <li key={index} className="view-task">
                                    {task.text}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-2 text-gray-500">No tasks for this date.</p>
                    )}
                </div>
            )}
        </div>
    );
};