// ReviewApplication.jsx
import React from 'react';

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
    // ...Add other mock entries like Bruce, Clark, Harley etc.
];

export const ReviewApplication = () => {
    return (
        <div className="bg-[#FFF8EB] min-h-screen pb-20">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-4 bg-[#D6F2F2]">
                <div className="flex items-center gap-2">
                    <img src="/images/logo.png" alt="Logo" className="h-12" />
                    <span className="text-xl font-bold">All In One</span>
                </div>
                <div className="flex gap-4">
                    {['Messages', 'Applications', 'Tickets', 'Properties'].map(label => (
                        <button key={label} className="bg-yellow-300 px-4 py-2 rounded-full font-semibold">
                            {label}
                        </button>
                    ))}
                    <button className="bg-yellow-300 px-4 py-2 rounded-full font-semibold">Log out</button>
                    <img src="/images/user-avatar.png" alt="User" className="w-10 h-10 rounded-full" />
                </div>
            </div>

            {/* Content */}
            <div className="px-12 mt-6">
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
                <div className="grid grid-cols-2 gap-6 mt-6">
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
                                <div>
                                    <h3 className="font-semibold text-lg">{app.name}</h3>
                                    <p className="text-sm">Age: {app.age}</p>
                                    <p className="text-sm">Occupation: {app.occupation}</p>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-sm font-medium">{app.status}</span>
                                    <span className="text-xl">{app.statusIcon}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};