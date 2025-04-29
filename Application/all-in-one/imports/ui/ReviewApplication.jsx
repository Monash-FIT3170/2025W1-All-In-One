// ReviewApplication.jsx
import React from 'react';
import Navbar from './components/Navbar';
import { ApplicantCard } from './components/ApplicantCard';

const mockApplications = [
    {
        id: 1,
        name: 'Tony Stark',
        age: 35,
        occupation: 'Iron Man',
        price: '$700 per week',
        location: 'Melton South, 3338',
        beds: 3,
        baths: 7,
        cars: 4,
        status: 'Rejected',
        statusIcon: '❌',
    },
    {
        id: 2,
        name: 'Bruce Wayne',
        age: 30,
        occupation: 'Batman',
        price: '$800 per week',
        location: 'Gotham City, 10001',
        beds: 4,
        baths: 5,
        cars: 2,
        status: 'Approved',
        statusIcon: '✅',
    },
    {
        id: 3,
        name: 'Clark Kent',
        age: 28,
        occupation: 'Superman',
        price: '$900 per week',
        location: 'Metropolis, 20001',
        beds: 5,
        baths: 6,
        cars: 3,
        status: 'Pending',
        statusIcon: '⏳',
    },
    {
        id: 4,
        name: 'Harleen Quinzel',
        age: 26,
        occupation: 'Harley Quinn',
        price: '$750 per week',
        location: 'Gotham City, 10001',
        beds: 2,
        baths: 3,
        cars: 1,
        status: 'Approved',
        statusIcon: '✅',
    },
    // ...Add other mock entries like Bruce, Clark, Harley etc.
];

export const ReviewApplication = () => {
    return (
        <div className="bg-[#FFF8EB] min-h-screen pb-20">
            {/* Content */}
            <div className="px-12 py-8">
                <h2 className="text-2xl font-semibold">Review Applications</h2>
                <p className="text-sm text-gray-600">All applications in one place!</p>
                <hr style={{
                    color: '#000000',
                    backgroundColor: '#000000',
                    height: .5,
                    borderColor: '#000000'
                }} className="my-4" />


                {/* Search + Filters */}
                <div className="mt-4 bg-[#D6F2F2] p-4 rounded-lg flex gap-4">
                    <input
                        type="text"
                        placeholder="Search Applicant..."
                        className="flex-1 px-4 py-2 rounded-md"
                        style={{ backgroundColor: '#FFF8E9' }}
                    />
                    <select className="dropdown-arrow flex-1">
                        <option>Select Property</option>
                    </select>
                    <select className="dropdown-arrow flex-1">
                        <option>Filter</option>
                    </select>
                </div>

                {/* Applications Grid */}
                <div className="grid grid-cols-2 gap-6 mt-6 ">
                    {mockApplications.map(app => (
                        <div key={app.id} className="flex bg-white rounded-lg shadow overflow-hidden">
                            {/* Left: Property Image + Info */}
                            <div className="w-1/2 p-4 bg-[#D6F2F2]">
                                <img src="/images/property.png" alt="Property" className="rounded mb-2" />
                                <p className="text-lg font-semibold">{app.price}</p>
                                <p className="text-sm text-gray-700">{app.location}</p>
                                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                    <span>🛏 {app.beds}</span>
                                    <span>🛁 {app.baths}</span>
                                    <span>🚗 {app.cars}</span>
                                </div>
                            </div>

                            {/* Right: Applicant Info */}
                            <div className="w-1/2 p-4 bg-[#EBFAFA] flex flex-col justify-between">
                                <ApplicantCard
                                    name={app.name}
                                    age={app.age}
                                    occupation={app.occupation}
                                    status={app.status}
                                    statusIcon={app.statusIcon}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};