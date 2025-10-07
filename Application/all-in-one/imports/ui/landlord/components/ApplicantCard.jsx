// ApplicantCard.jsx
import React from 'react';

export const ApplicantCard = ({ name, desc, age, status, statusIcon, finaliseButton, agentFlag }) => {
    return (
        <div className="bg-white rounded-lg shadow w-full h-full flex items-center justify-between px-10 py-4">
            <div>
                <p className="font-semibold text-lg">{name}</p>
                <p className="text-sm text-gray-600">Age: {age}</p>
                <p className="text-sm text-gray-600">Description: {desc}</p>
                {agentFlag && (
                    <p className="text-sm text-gray-600 mt-2">
                        Agent Flag: <span className="font-semibold">{agentFlag}</span>
                    </p>
                )}
                <div className="text-sm text-gray-600 mt-4">{finaliseButton}</div>
            </div>
            <div className="text-center">
                <div className="inline-block px-3 py-1 text-3xl font-semibold rounded-full">{statusIcon}</div>
                {/* <p className="inline-block px-3 py-1 text-sm font-semibold rounded-full">{status}</p> */}
            </div>
        </div>
    );
};
