import React, { useState } from "react";

export const Calendar = ({ tasks }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Get the start and end of the current week (starting on Monday)
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek; // Shift Sunday (-6) or other days to Monday
    startOfWeek.setDate(currentDate.getDate() + daysToMonday);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to Sunday (end of the week)

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

    return (
        <div className="calendar-container">
            <div className="flex justify-around items-center mb-4">
                <button onClick={handlePrevWeek} className="bg-blue-500 px-2 py-1 rounded">
                    &lt; Prev Week
                </button>
                <h2 className="text-center text-xl font-bold">
                    Week of {startOfWeek.toLocaleDateString()} - {endOfWeek.toLocaleDateString()}
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
                            className={`calendar-day border p-2 text-center rounded ${
                                hasTask ? "bg-blue-100 text-blue-600 font-bold" : "text-gray-700"
                            }`}
                        >
                            <div>{day.getDate()}</div>
                            <div>{tasks
                                .filter((task) => {
                                    const taskDate = new Date(task.dueDate).toDateString();
                                    const calendarDate = day.toDateString();
                                    return taskDate === calendarDate;
                                })
                                .map((task, taskIndex) => (
                                    <div key={taskIndex} className="text-sm text-gray-800 mt-1">
                                         {task.text}
                                    </div>
                                ))}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};