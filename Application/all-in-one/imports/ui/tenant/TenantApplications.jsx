// TenantApplications.jsx
// This component displays all rental applications submitted by the currently logged-in tenant
// It shows property details, application status, and tenant information for each application

import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { RentalApplications, Properties, Tenants, Employment } from '/imports/api/database/collections';
import Navbar from './components/TenNavbar';
import { useLocation, Link } from "react-router-dom";   // ✅ fixed
import { ApplicantCard } from './components/ApplicantCard';


export default function TenantApplications() {
    // Get the current route location (useful for navigation context)
    const location = useLocation();
    
    // Get the current user's ID (tenant ID) from Meteor's authentication system
    const tenantID = Meteor.userId();

    // Debug log to verify tenant ID is being retrieved correctly
    console.log("Tenant ID:", tenantID);

    // useTracker hook manages reactive data subscriptions and returns filtered data
    // This ensures the component re-renders when data changes in the database
    const { isReady, applications, tenants, properties, employments } = useTracker(() => {
        // Subscribe to different data collections to get real-time updates
        const sub1 = Meteor.subscribe('rentalApplications'); // All rental applications
        const sub2 = Meteor.subscribe('tenants'); // All tenant information
        const sub3 = Meteor.subscribe('properties'); // All property listings
        const sub4 = Meteor.subscribe('employment'); // All employment records

        // Check if all subscriptions are ready (data has been loaded)
        const isReady = sub1.ready() && sub2.ready() && sub3.ready() && sub4.ready();

        // Return data only when all subscriptions are ready
        // Filter applications to show only those belonging to the current tenant
        return {
            isReady,
            applications: isReady ? RentalApplications.find({ ten_id: tenantID }).fetch() : [],
            tenants: isReady ? Tenants.find().fetch() : [],
            properties: isReady ? Properties.find().fetch() : [],
            employments: isReady ? Employment.find().fetch() : [],
        };
    });

    const [searchTerms, setSearchTerms] = useState({});

    if (!isReady) {
        return <div className="p-8 text-gray-600">Loading applications...</div>;
    }

    const handleTenantAdd = (appId, tenId) => {
        Meteor.call('rentalApplications.addTenant', appId, tenId, (err) => {
            if (err) alert(err.reason);
        });
    };

    const handleTenantRemove = (appId, tenId) => {
        Meteor.call('rentalApplications.removeTenant', appId, tenId, (err) => {
            if (err) alert(err.reason);
        });
    };

    return (
        // Main container with cream background and minimum height for full screen
        <div className="bg-[#FFF8EB] min-h-screen pb-20">
            {/* Navigation bar at the top */}
            <Navbar />
            
            {/* Main content area with padding */}
            <div className="px-12 py-8">
                {/* Page header with title and description */}
                <h2 className="text-2xl font-semibold">My Applications</h2>
                <p className="text-sm text-gray-600">Track your submitted rental applications</p>
                <hr className="my-4 border-black" />

                {/* Grid container for application cards */}
                <div className="grid grid-cols-1 gap-6 mt-6">
                    {/* Map through each application to create individual application cards */}
                    {applications.map(app => {
                        // Find related data for this application by matching IDs
                        const tenant = tenants.find(t => t.ten_id === app.ten_id);
                        const property = properties.find(p => p.prop_id === app.prop_id);
                        const employment = employments.find(e => e.employment_id === app.employment_id);

                        const searchTerm = searchTerms[app._id] || '';
                        const filteredTenants = tenants.filter(t =>
                            `${t.ten_fn} ${t.ten_ln}`.toLowerCase().includes(searchTerm.toLowerCase())
                        );

                        return (
                            // Application card container with flexbox layout
                            <div key={app._id} className="flex overflow-hidden gap-8">
                                {/* Left side: Property image with overlay information */}
                                <div className="relative w-1/4 h-64 rounded-2xl overflow-hidden">
                                    {/* Property image (currently using placeholder) */}
                                    <img
                                        src="/images/property.png"
                                        alt="Property"
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    
                                    {/* Overlay panel at bottom with property details */}
                                    <div className="absolute bottom-0 left-0 w-full" style={{ height: '35%' }}>
                                        <div className="bg-white bg-opacity-95 h-full flex flex-col justify-center px-6 py-2 shadow-lg">
                                            {/* Rent amount and property address */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-900">
                                                    ${app.app_rent} per week
                                                </span>
                                                <span className="text-sm font-semibold text-gray-700 truncate">
                                                    {property?.prop_address || 'Unknown address'}
                                                </span>
                                            </div>
                                            
                                            {/* Property features: beds, baths, car spots */}
                                            <div className="flex gap-4 mt-1 text-gray-700 text-md">
                                                <span>🛏 {property?.prop_numbeds || 0}</span>
                                                <span>🛁 {property?.prop_numbaths || 0}</span>
                                                <span>🚗 {property?.prop_numcarspots || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right side: Application information and status */}
                                <div className="w-3/4 p-8 bg-[#CBADD8] rounded-2xl flex flex-col justify-between">
                                    <ApplicantCard
                                        appId={app._id}
                                        name={`${tenant?.ten_fn || "Unknown"} ${
                                            tenant?.ten_ln || ""
                                        }`}
                                        desc={app.app_desc || "N/A"}
                                        status={app.status || "Pending"}
                                        statusIcon={app.status === "Approved"
                                            ? "✅"
                                            : app.status === "Rejected"
                                            ? "❌"
                                            : "⏳"}
                                        editButton={
                                            app.status != "Approved" && app.status != "Rejected" && app.submitted == false ? (
                                            <Link
                                                key={property.prop_id}
                                                to={`/Apply/${property.prop_id}?tenantId=${tenantID}`}
                                                className="ml-4 bg-white text-purple-700 font-semibold px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition"
                                            >
                                                Edit
                                            </Link>
                                        ) : null
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
