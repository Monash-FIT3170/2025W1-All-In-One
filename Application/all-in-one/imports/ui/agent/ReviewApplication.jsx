// ReviewApplication.jsx
import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { ApplicantCard } from './components/ApplicantCard';
import { useTracker } from 'meteor/react-meteor-data';
import { RentalApplications, Properties, Tenants, Employment } from '/imports/api/database/collections';
import FilterMenu from './components/FilterMenu';

export const ReviewApplication = () => {
    const [allSearch, setAllSearch] = useState('');
    const [showFilterMenu, setShowFilterMenu] = useState(false);

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

    // Filter applications based on search criteria
    const filteredApplications = applications.filter(app => {
        const tenant = tenants.find(t => t.ten_id === app.ten_id);
        const property = properties.find(p => p.prop_id === app.prop_id);
        
        const tenantName = `${tenant?.ten_fn || ''} ${tenant?.ten_ln || ''}`.toLowerCase();
        const propertyAddress = (property?.prop_address || '').toLowerCase();
        const searchTerm = allSearch.toLowerCase();
        
        // Return true if either the tenant name or property address matches the search term
        return tenantName.includes(searchTerm) || propertyAddress.includes(searchTerm);
    });

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
                <div className="mt-4 bg-[#CBADD8] px-6 py-4 rounded-lg flex gap-4 relative">
                    <input
                        type="text"
                        placeholder="Search Applicant..."
                        className="flex-1 px-4 py-2 rounded-md"
                        style={{ backgroundColor: '#FFF8E9' }}
                        value={allSearch}
                        onChange={(e) => setAllSearch(e.target.value)}
                    />
                    <button
                        className="w-1/5 px-4 py-2 rounded-md text-white"
                        style={{ backgroundColor: '#9747FF' }}
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                    >
                        Filter
                    </button>
                    <FilterMenu
                        show={showFilterMenu}
                        onClose={() => setShowFilterMenu(false)}
                    />
                </div>

                {/* Applications Grid */}
                <div className="grid grid-cols-1 gap-6 mt-6 ">
                    {filteredApplications.map(app => {
                        const tenant = tenants.find(t => t.ten_id === app.ten_id);
                        const property = properties.find(p => p.prop_id === app.prop_id);
                        const employment = employments.find(e => e.employment_id === app.employment_id);

                        return (
                            <div key={app._id} className="flex overflow-hidden gap-8">
                                {/* Left: Property Image + Info */}
                                <div className="relative w-1/4 h-64 rounded-2xl overflow-hidden ">
                                    {/* Property Image as Background */}
                                    <img
                                        src="/images/property.png"
                                        alt="Property"
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />

                                    {/* White Overlay Box */}
                                    <div className="absolute bottom-0 left-0 w-full" style={{ height: '35%' }}>
                                        <div className="bg-white bg-opacity-95 h-full flex flex-col justify-center px-6 py-2 shadow-lg">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-900">${app.app_rent} per week</span>
                                                <span className="text-sm font-semibold text-gray-700 truncate">{property?.prop_address || 'Unknown address'}</span>
                                            </div>
                                            <div className="flex gap-4 mt-1 text-gray-700 text-md">
                                                <span className="flex items-center gap-1">🛏 {property?.prop_numbeds || 0}</span>
                                                <span className="flex items-center gap-1">🛁 {property?.prop_numbaths || 0}</span>
                                                <span className="flex items-center gap-1">🚗 {property?.prop_numcarspots || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Applicant Info */}
                                <div className="w-3/4 p-8 bg-[#CBADD8] rounded-2xl flex flex-col justify-between">
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
                                                }}>
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