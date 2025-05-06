// ReviewApplication.jsx
import React from 'react';
import { Meteor } from 'meteor/meteor';
import { ApplicantCard } from './components/ApplicantCard';
import { useTracker } from 'meteor/react-meteor-data';
import { RentalApplications, Properties, Tenants, Employment } from '/imports/api/collections';


export const ReviewApplication = () => {

    const { isReady, applications, tenants, properties, employments } = useTracker(() => {
        const sub1 = Meteor.subscribe('rentalApplications');
        const sub2 = Meteor.subscribe('properties');
        const sub3 = Meteor.subscribe('tenants');
        const sub4 = Meteor.subscribe('employment');

        const isReady = sub1.ready() && sub2.ready() && sub3.ready() && sub4.ready();

        return {
            isReady,
            applications: isReady ? RentalApplications.find().fetch() : [],
            tenants: isReady ? Tenants.find().fetch() : [],
            properties: isReady ? Properties.find().fetch() : [],
            employments: isReady ? Employment.find().fetch() : []
        };
    });

    if (!isReady) {
        return <div className="p-8 text-gray-600">Loading applications...</div>;
    }

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
                    {applications.map(app => {
                        const tenant = tenants.find(t => t.ten_id === app.ten_id);
                        const property = properties.find(p => p.prop_id === app.prop_id);
                        const employment = employments.find(e => e.employment_id === app.employment_id);

                        return (
                            <div key={app._id} className="flex bg-white rounded-lg shadow overflow-hidden">
                                {/* Left: Property Image + Info */}
                                <div className="w-1/2 p-4 bg-[#D6F2F2]">
                                    <img src="/images/property.png" alt="Property" className="rounded mb-2" />
                                    <p className="text-lg font-semibold">${app.app_rent} per week</p>
                                    <p className="text-sm text-gray-700">{property?.prop_address || 'Unknown address'}</p>
                                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                        <span>🛏 {property?.prop_numbeds || 0}</span>
                                        <span>🛁 {property?.prop_numbaths || 0}</span>
                                        <span>🚗 {property?.prop_numcarspots || 0}</span>
                                    </div>
                                </div>

                                {/* Right: Applicant Info */}
                                <div className="w-1/2 p-4 bg-[#EBFAFA] flex flex-col justify-between">
                                    <ApplicantCard
                                        name={`${tenant?.ten_fn || 'Unknown'} ${tenant?.ten_ln || ''}`}
                                        age={'N/A'}
                                        occupation={employment?.emp_job_title || 'N/A'}
                                        status={app.status || 'Pending'}
                                        statusIcon={
                                            <select
                                                className="px-2 py-1 rounded border bg-white text-sm"
                                                value={app.status || 'Pending'}
                                                onChange={(e) => {
                                                    const newStatus = e.target.value;
                                                    Meteor.call('rentalApplications.setStatus', app._id, newStatus);
                                                }}
                                            >
                                                <option value="Pending">⏳</option>
                                                <option value="Approved">✅</option>
                                                <option value="Rejected">❌</option>
                                            </select>
                                        }
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// TEMPORARY: Ideally move to a server method file
import { check } from 'meteor/check';
Meteor.methods({
    'rentalApplications.setStatus'(id, status) {
        check(id, String);
        check(status, String);
        RentalApplications.update(id, { $set: { status } });
    },
});