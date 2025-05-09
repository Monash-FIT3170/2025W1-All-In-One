// ApplicantCard.jsx
import React from 'react';

export const ApplicantCard = ({ name, age, occupation, status, statusIcon }) => {
    return (
        <div className="w-full h-full rounded p-4 bg-white flex flex-col justify-between">
            <div>
                <h3 className="font-semibold text-lg">{name}</h3>
                <p className="text-sm">Age: {age}</p>
                <p className="text-sm">Occupation: {occupation}</p>
            </div>
            <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium">{status}</span>
                <span className="text-xl">{statusIcon}</span>
            </div>
        </div>
    );
};