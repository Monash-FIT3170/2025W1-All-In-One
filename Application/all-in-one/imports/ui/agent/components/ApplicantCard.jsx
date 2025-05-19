// ApplicantCard.jsx
import React from 'react';

export const ApplicantCard = ({ name, age, occupation, status, statusIcon, ll_status }) => {
    return (
        <div className="bg-white rounded-lg shadow w-full h-full flex items-center justify-between px-10 py-4">
            <div>
                <p className="font-semibold text-lg">{name}</p>
                <p className="text-sm text-gray-600">Age: {age}</p>
                <p className="text-sm text-gray-600">Occupation: {occupation}</p>
            </div>
            <div className="text-center">
                <div className="text-3xl">{statusIcon}</div>
                <p className="text-2xl text-gray-600">{status}</p>
            </div>
        </div>
    );
};