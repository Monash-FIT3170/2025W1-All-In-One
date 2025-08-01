// ReviewApplication.jsx
import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { ApplicantCard } from './components/ApplicantCard';
import { useTracker } from 'meteor/react-meteor-data';
import { RentalApplications, Properties, Tenants, Employment } from '/imports/api/database/collections';
import FilterMenu from './components/FilterMenu';
import StatusMenu from './components/StatusMenu';
import Navbar from "./components/AgentNavbar";

export default function ReviewApplication() {
    // State for the search bar
    const [allSearch, setAllSearch] = useState('');
    // State to show/hide the filter menu
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    // State to track which application's status menu is open
    const [statusMenuAppId, setStatusMenuAppId] = useState(null);
    // State for selected filters
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [selectedApplicants, setSelectedApplicants] = useState([]);
    const [selectedProperties, setSelectedProperties] = useState([]);

    // Subscribe to and fetch all necessary collections from the database
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

    // Show loading message until all subscriptions are ready
    if (!isReady) {
        return <div className="p-8 text-gray-600">Loading applications...</div>;
    }

    // Filter applications based on search bar and selected filters
    const filteredApplications = applications.filter(app => {
        // Find the tenant and property for this application
        const tenant = tenants.find(t => t.ten_id === app.ten_id);
        const property = properties.find(p => p.prop_id === app.prop_id);
        
        // Prepare search terms
        const tenantName = `${tenant?.ten_fn || ''} ${tenant?.ten_ln || ''}`.toLowerCase();
        const propertyAddress = (property?.prop_address || '').toLowerCase();
        const searchTerm = allSearch.toLowerCase();

        // Check if the application matches the selected filters
        const matchStatus = selectedStatuses.length === 0 || selectedStatuses.includes(app.status);
        const matchApplicant = selectedApplicants.length === 0 || selectedApplicants.includes(app.ten_id);
        const matchProperty = selectedProperties.length === 0 || selectedProperties.includes(app.prop_id);
        
        // Return true if all filters match and the search term matches either the tenant or property
        return matchStatus && matchApplicant && matchProperty && (tenantName.includes(searchTerm) || propertyAddress.includes(searchTerm));
    });

    return (
        <div className="bg-[#FFF8EB] min-h-screen pb-20">
            <Navbar/>
            {/* Main content container */}
            <div className="px-12 py-8">
                <h2 className="text-2xl font-semibold">Review Applications</h2>
                <p className="text-sm text-gray-600">All applications in one place!</p>
                <hr style={{
                    color: '#000000',
                    backgroundColor: '#000000',
                    height: .5,
                    borderColor: '#000000'
                }} className="my-4" />

                {/* Search bar and filter button */}
                <div className="mt-4 bg-[#CBADD8] px-6 py-4 rounded-lg flex gap-4 relative">
                    {/* Search input for applicants and properties */}
                    <input
                        type="text"
                        placeholder="Search Applicant..."
                        className="flex-1 px-4 py-2 rounded-md"
                        style={{ backgroundColor: '#FFF8E9' }}
                        value={allSearch}
                        onChange={(e) => setAllSearch(e.target.value)}
                    />
                    {/* Button to open the filter menu */}
                    <button
                        className="w-1/5 px-4 py-2 rounded-md text-white"
                        style={{ backgroundColor: '#9747FF' }}
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                    >
                        Filter
                    </button>
                    {/* Filter menu component, receives all filter state and setters */}
                    <FilterMenu
                        show={showFilterMenu}
                        onClose={() => setShowFilterMenu(false)}
                        applications={applications}
                        tenants={tenants}
                        properties={properties}
                        selectedStatuses={selectedStatuses}
                        setSelectedStatuses={setSelectedStatuses}
                        selectedApplicants={selectedApplicants}
                        setSelectedApplicants={setSelectedApplicants}
                        selectedProperties={selectedProperties}
                        setSelectedProperties={setSelectedProperties}
                    />
                </div>

                {/* Applications Grid: displays filtered applications */}
                <div className="grid grid-cols-1 gap-6 mt-6 ">
                    {filteredApplications.map(app => {
                        // Find the tenant, property, and employment for this application
                        const tenant = tenants.find(t => t.ten_id === app.ten_id);
                        const property = properties.find(p => p.prop_id === app.prop_id);
                        const employment = employments.find(e => e.employment_id === app.employment_id);

                        return (
                            // Card for each application
                            <div key={app._id} className="flex overflow-hidden gap-8">
                                {/* Left: Property image and overlay info */}
                                <div className="relative w-1/4 h-64 rounded-2xl overflow-hidden ">
                                    {/* Property Image as Background */}
                                    <img
                                        src={`/images/properties/${property.prop_id}/main.jpg`}
                                        alt="Property"
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />

                                    {/* White Overlay Box at the bottom */}
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

                                {/* Right: Applicant Info Card */}
                                <div className="w-3/4 p-8 bg-[#CBADD8] rounded-2xl flex flex-col justify-between">
                                    <ApplicantCard
                                        name={`${tenant?.ten_fn || 'Unknown'} ${tenant?.ten_ln || ''}`}
                                        desc={app.app_desc || 'N/A'}
                                        occupation={employment?.emp_job_title || 'N/A'}
                                        status={app.status || 'Pending'}
                                        statusIcon={
                                            // Status icon button and menu
                                            <div className="relative">
                                                <button
                                                    className="px-2 py-1 rounded bg-white text-sm"
                                                    onClick={() => setStatusMenuAppId(app._id)}
                                                >
                                                    {app.status === 'Approved' ? '✅' : app.status === 'Rejected' ? '❌' : '⏳'}
                                                </button>
                                                {/* Status menu for accepting/rejecting application */}
                                                <StatusMenu
                                                    show={statusMenuAppId === app._id}
                                                    onClose={() => setStatusMenuAppId(null)}
                                                    onAccept={() => {
                                                        Meteor.call('rentalApplications.setStatus', app._id, 'Approved');
                                                        setStatusMenuAppId(null);
                                                    }}
                                                    onReject={() => {
                                                        Meteor.call('rentalApplications.setStatus', app._id, 'Rejected');
                                                        setStatusMenuAppId(null);
                                                    }}
                                                    status={app.status}
                                                />
                                            </div>
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
}