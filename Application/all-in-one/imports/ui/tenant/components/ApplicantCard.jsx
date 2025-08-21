// ApplicantCard.jsx
import React from 'react';
import { Meteor } from "meteor/meteor";

export const ApplicantCard = ({appId, name, desc, status, statusIcon, editButton }) => {
    return (
        <div className="bg-white rounded-lg shadow w-full h-full flex flex-col justify-center px-10 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-semibold text-lg">{name}</p>
                    <p className="text-sm text-gray-600">{desc}</p>
                </div>
                <div className="text-center">
                    <div className="inline-block px-3 py-1 text-sm font-semibold rounded-full">{statusIcon}</div>
                    <span
                        className={`inline-block px-3 py-1 mt-1 text-sm font-semibold rounded-full ${
                            status === 'Approved'
                                ? 'bg-green-200 text-green-800'
                                : status === 'Rejected'
                                ? 'bg-red-200 text-red-800'
                                : status === 'Withdrawn'
                                ? 'bg-gray-200 text-gray-800'
                                : 'bg-yellow-200 text-yellow-800'
                        }`}
                    >
                        {status || 'Pending'}
                    </span>
                </div>
            </div>
            <div className="flex justify-between items-center mt-auto font-semibold pt-2">
                <button
                    className="rounded-full bg-gray-200 px-3 py-1 text-sm"
                    onClick={() => {
                        Meteor.call("rentalApplications.setStatus", appId, "Withdrawn");
                    }}
                >
                    Withdraw Application
                </button>
                <p className="text-sm text-gray-600">{editButton}</p>
            </div>
        </div>
    );
};