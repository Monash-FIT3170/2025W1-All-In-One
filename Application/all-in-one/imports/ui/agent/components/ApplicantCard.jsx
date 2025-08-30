// ApplicantCard.jsx
import React from 'react';

export const ApplicantCard = ({ name, desc, age, status, statusIcon, finaliseButton, attendanceStatus, onAttendanceClick }) => {
    const getAttendanceTag = () => {
        if (!attendanceStatus) return null;
        
        switch (attendanceStatus.status) {
            case 'present':
                return (
                    <button 
                        onClick={onAttendanceClick}
                        className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer"
                        title="Click to view notes"
                    >
                        Present
                    </button>
                );
            case 'registered':
                return (
                    <button 
                        onClick={onAttendanceClick}
                        className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                        title="Click to view notes"
                    >
                        Registered
                    </button>
                );
            case 'absent':
                return (
                    <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-600">
                        Absent
                    </span>
                );
        }
    };

    return (
        <div className="bg-white rounded-lg shadow w-full h-full flex items-center justify-between px-10 py-4">
            <div>
                <p className="font-semibold text-lg">{name}</p> 
                <p className="text-sm text-gray-600">Age: {age}</p>
                <p className="text-sm text-gray-600">Description: {desc}</p>
                <div className="text-sm text-gray-600 mt-4">{finaliseButton}</div>
            </div>
            <div className="text-center space-y-2">
                <div className="inline-block px-3 py-1 text-sm font-semibold rounded-full">{statusIcon}</div>
                {/* <p className="inline-block px-3 py-1 text-sm font-semibold rounded-full">{status}</p> */}
                <div className="text-sm text-gray-600 mt-4">{getAttendanceTag()}</div>
            </div>
        </div>
    );
};
