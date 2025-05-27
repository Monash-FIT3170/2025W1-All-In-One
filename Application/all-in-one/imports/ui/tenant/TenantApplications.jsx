// TenantApplications.jsx
import React from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { RentalApplications, Properties, Tenants, Employment } from '/imports/api/database/collections';
import Navbar from './components/TenNavbar'; // Adjust if you're using a different navbar
import { useLocation } from "react-router-dom";

export default function TenantApplications() {

    const location = useLocation();
    const tenantID = Meteor.userId();

    console.log("Tenant ID:", tenantID);

    const { isReady, applications, tenants, properties, employments } = useTracker(() => {
        const sub1 = Meteor.subscribe('rentalApplications');
        const sub2 = Meteor.subscribe('tenants');
        const sub3 = Meteor.subscribe('properties');
        const sub4 = Meteor.subscribe('employment');

        const isReady = sub1.ready() && sub2.ready() && sub3.ready() && sub4.ready();

        // Filter applications by tenantID here
        return {
            isReady,
            applications: isReady ? RentalApplications.find({ ten_id: tenantID }).fetch() : [],
            tenants: isReady ? Tenants.find().fetch() : [],
            properties: isReady ? Properties.find().fetch() : [],
            employments: isReady ? Employment.find().fetch() : [],
        };
    });

    if (!isReady) {
        return <div className="p-8 text-gray-600">Loading applications...</div>;
    }

    return (
        <div className="bg-[#FFF8EB] min-h-screen pb-20">
            <Navbar />
            <div className="px-12 py-8">
                <h2 className="text-2xl font-semibold">My Applications</h2>
                <p className="text-sm text-gray-600">Track your submitted rental applications</p>
                <hr className="my-4 border-black" />

                <div className="grid grid-cols-1 gap-6 mt-6">
                    {applications.map(app => {
                        const tenant = tenants.find(t => t.ten_id === app.ten_id);
                        const property = properties.find(p => p.prop_id === app.prop_id);
                        const employment = employments.find(e => e.employment_id === app.employment_id);

                        return (
                            <div key={app._id} className="flex overflow-hidden gap-8">
                                {/* Left: Property Image */}
                                <div className="relative w-1/4 h-64 rounded-2xl overflow-hidden">
                                    <img
                                        src="/images/property.png"
                                        alt="Property"
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-0 left-0 w-full" style={{ height: '35%' }}>
                                        <div className="bg-white bg-opacity-95 h-full flex flex-col justify-center px-6 py-2 shadow-lg">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-900">
                                                    ${app.app_rent} per week
                                                </span>
                                                <span className="text-sm font-semibold text-gray-700 truncate">
                                                    {property?.prop_address || 'Unknown address'}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-1 text-gray-700 text-md">
                                                <span>🛏 {property?.prop_numbeds || 0}</span>
                                                <span>🛁 {property?.prop_numbaths || 0}</span>
                                                <span>🚗 {property?.prop_numcarspots || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Application Info */}
                                <div className="w-3/4 p-8 bg-[#CBADD8] rounded-2xl flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">
                                            {tenant?.ten_fn || 'Unknown'} {tenant?.ten_ln || ''}
                                        </h3>
                                        <p className="text-white text-sm italic mb-2">
                                            "{app.app_desc || 'No description'}"
                                        </p>
                                        <p className="text-white text-sm">
                                            Occupation: {employment?.emp_job_title || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="mt-4">
                                        <span
                                            className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                                                app.status === 'Approved'
                                                    ? 'bg-green-200 text-green-800'
                                                    : app.status === 'Rejected'
                                                    ? 'bg-red-200 text-red-800'
                                                    : 'bg-yellow-200 text-yellow-800'
                                            }`}
                                        >
                                            {app.status || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
