// ReviewApplication.jsx
import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { ApplicantCard } from './components/ApplicantCard';
import { useTracker } from 'meteor/react-meteor-data';
import { RentalApplications, Properties, Tenants, Employment } from '/imports/api/database/collections';
import FilterMenu from './components/FilterMenu';
import StatusMenu from './components/StatusMenu';
import Navbar from "../landlord/components/LandlordNavbar";
import Footer from "../landlord/components/Footer";

export const ReviewApplication = () => {
    const [applicantSearch, setApplicantSearch] = useState('');
    const [propertySearch, setPropertySearch] = useState('');
    const [feedbackData, setFeedbackData] = useState({});
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [statusMenuAppId, setStatusMenuAppId] = useState(null);
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [selectedApplicants, setSelectedApplicants] = useState([]);
    const [selectedProperties, setSelectedProperties] = useState([]);

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

    if (!isReady) return <div className="p-8 text-gray-600">Loading applications...</div>;

    const filteredApplications = applications.filter(app => {
        const tenant = tenants.find(t => t.ten_id === app.ten_id);
        const property = properties.find(p => p.prop_id === app.prop_id);
        const tenantName = `${tenant?.ten_fn || ''} ${tenant?.ten_ln || ''}`.toLowerCase();
        const propertyAddress = (property?.prop_address || '').toLowerCase();
        const applicantSearchTerm = applicantSearch.toLowerCase();
        const propertySearchTerm = propertySearch.toLowerCase();
        const matchStatus = selectedStatuses.length === 0 || selectedStatuses.includes(app.status);
        const matchApplicant = selectedApplicants.length === 0 || selectedApplicants.includes(app.ten_id);
        const matchProperty = selectedProperties.length === 0 || selectedProperties.includes(app.prop_id);

        return matchStatus && matchApplicant && matchProperty && tenantName.includes(applicantSearchTerm) && propertyAddress.includes(propertySearchTerm);
    });

    return (
        <>
            <Navbar />
            <div className="bg-[#FFF8EB] min-h-screen pb-20">
                <div className="px-12 py-8">
                    <h2 className="text-2xl font-semibold">Review Applications</h2>
                    <p className="text-sm text-gray-600">All applications in one place!</p>
                    <hr className="my-4 border-t border-black" />

                    <div className="mt-4 bg-[#CBADD8] px-6 py-4 rounded-lg flex gap-4 relative">
                        <input
                            type="text"
                            placeholder="Search Applicant..."
                            className="flex-1 px-4 py-2 rounded-md bg-[#FFF8E9]"
                            value={applicantSearch}
                            onChange={(e) => setApplicantSearch(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Search Property..."
                            className="flex-1 px-4 py-2 rounded-md bg-[#FFF8E9]"
                            value={propertySearch}
                            onChange={(e) => setPropertySearch(e.target.value)}
                        />
                        <button
                            className="w-1/5 px-4 py-2 rounded-md text-white bg-[#9747FF]"
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                        >
                            Filter
                        </button>
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

                    <div className="grid grid-cols-1 gap-6 mt-6">
                        {filteredApplications.map(app => {
                            const tenant = tenants.find(t => t.ten_id === app.ten_id);
                            const property = properties.find(p => p.prop_id === app.prop_id);
                            const employment = employments.find(e => e.employment_id === app.employment_id);

                            return (
                                <div key={app._id} className="flex overflow-hidden gap-8">
                                    <div className="relative w-1/4 h-64 rounded-2xl overflow-hidden">
                                        <img src="/images/property.png" alt="Property" className="absolute inset-0 w-full h-full object-cover" />
                                        <div className="absolute bottom-0 left-0 w-full h-1/3">
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

                                    <div className="w-3/4 p-8 bg-[#CBADD8] rounded-2xl flex flex-col justify-between">
                                        <ApplicantCard
                                            name={`${tenant?.ten_fn || 'Unknown'} ${tenant?.ten_ln || ''}`}
                                            age={'N/A'}
                                            occupation={employment?.emp_job_title || 'N/A'}
                                            status={app.status || 'Pending'}
                                            statusIcon={
                                                <div className="relative">
                                                    <button
                                                        className="px-2 py-1 rounded bg-white text-sm"
                                                        onClick={() => setStatusMenuAppId(app._id)}
                                                    >
                                                        {app.status === 'Approved' ? <img src="/images/GreenTick.png" alt="Logo" className="h-12" /> : app.status === 'Rejected' ? <img src="/images/GreenTick.png" alt="Logo" className="h-12" /> : <img src="/images/timer.png" alt="Logo" className="h-12" /> }
                                                    </button>
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
                                        <div className="p-4 mt-4 bg-white rounded-md">
                                            <h3 className="text-md font-semibold mb-2 text-center">Leave Feedback</h3>
                                            <form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    const currentFeedback = feedbackData[app._id];
                                                    if (currentFeedback) {
                                                        console.log("Feedback text:", currentFeedback.feedbackText);
                                                        console.log("Rating:", currentFeedback.rating);
                                                    }
                                                }}
                                                className="space-y-2"
                                            >
                                                <input
                                                    type="text"
                                                    placeholder="Enter your feedback"
                                                    value={feedbackData[app._id]?.feedbackText || ''}
                                                    onChange={(e) =>
                                                        setFeedbackData({
                                                            ...feedbackData,
                                                            [app._id]: {
                                                                ...feedbackData[app._id],
                                                                feedbackText: e.target.value,
                                                            },
                                                        })
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                                />
                                                <select
                                                    value={feedbackData[app._id]?.rating || 'Shortlisted'}
                                                    onChange={(e) =>
                                                        setFeedbackData({
                                                            ...feedbackData,
                                                            [app._id]: {
                                                                ...feedbackData[app._id],
                                                                rating: e.target.value,
                                                            },
                                                        })
                                                    }
                                                    className="w-full px-3 py-2 border border-black rounded-md shadow-sm bg-white"
                                                >
                                                    <option value="Shortlisted">🟢 Shortlisted</option>
                                                    <option value="To be Reviewed">🟡 To be Reviewed</option>
                                                    <option value="Flagged">🔴 Flagged</option>
                                                </select>
                                                <button type="submit" className="w-full bg-[#9747FF] hover:bg-[#7d3dd1] text-white font-semibold py-2 rounded-md shadow">
                                                    Submit
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
};
