import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { RentalApplications, Properties, Tenants, Employment, SharedLeaseGroups } from '/imports/api/database/collections';
import FilterMenu from './components/FilterMenu';
import StatusMenu from './components/StatusMenu';
import Navbar from "./components/AgentNavbar";
import { ApplicantCard } from './components/ApplicantCard';

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

  // Subscribe and fetch data including SharedLeaseGroups
  const { isReady, applications, tenants, properties, employments, sharedLeaseGroups } = useTracker(() => {
    const sub1 = Meteor.subscribe('rentalApplications');
    const sub2 = Meteor.subscribe('properties');
    const sub3 = Meteor.subscribe('tenants');
    const sub4 = Meteor.subscribe('employment');
    const sub5 = Meteor.subscribe('sharedLeaseGroups'); // <-- new subscription

    const isReady = sub1.ready() && sub2.ready() && sub3.ready() && sub4.ready() && sub5.ready();

    return {
      isReady,
      applications: isReady ? RentalApplications.find().fetch() : [],
      tenants: isReady ? Tenants.find().fetch() : [],
      properties: isReady ? Properties.find().fetch() : [],
      employments: isReady ? Employment.find().fetch() : [],
      sharedLeaseGroups: isReady ? SharedLeaseGroups.find().fetch() : [],
    };
  });

  if (!isReady) {
    return <div className="p-8 text-gray-600">Loading applications...</div>;
  }

  // Filter applications based on search and selected filters
  const filteredApplications = applications.filter(app => {
    const tenant = tenants.find(t => t.ten_id === app.ten_id);
    const property = properties.find(p => p.prop_id === app.prop_id);

    const tenantName = `${tenant?.ten_fn || ''} ${tenant?.ten_ln || ''}`.toLowerCase();
    const propertyAddress = (property?.prop_address || '').toLowerCase();
    const searchTerm = allSearch.toLowerCase();

    const matchStatus = selectedStatuses.length === 0 || selectedStatuses.includes(app.status);
    const matchApplicant = selectedApplicants.length === 0 || selectedApplicants.includes(app.ten_id);
    const matchProperty = selectedProperties.length === 0 || selectedProperties.includes(app.prop_id);

    return matchStatus && matchApplicant && matchProperty &&
      (tenantName.includes(searchTerm) || propertyAddress.includes(searchTerm));
  });

  return (
    <div className="bg-[#FFF8EB] min-h-screen pb-20">
      <Navbar />
      <div className="px-12 py-8">
        <h2 className="text-2xl font-semibold">Review Applications</h2>
        <p className="text-sm text-gray-600">All applications in one place!</p>
        <hr
          style={{
            color: '#000000',
            backgroundColor: '#000000',
            height: 0.5,
            borderColor: '#000000'
          }}
          className="my-4"
        />

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

            // Get Shared Lease Group info if exists
            const group = app.sharedLeaseGroupId
              ? sharedLeaseGroups.find(g => g._id === app.sharedLeaseGroupId)
              : null;

            // Get tenants of the group (excluding the main tenant)
            const groupMembers = group?.members
              ?.map(tenId => tenants.find(t => t.ten_id === tenId))
              ?.filter(t => t && t.ten_id !== app.ten_id) || [];

            return (
              <div key={app._id} className="flex overflow-hidden gap-8 bg-white rounded-3xl shadow-lg p-6">
                <div className="relative w-1/4 h-64 rounded-2xl overflow-hidden shadow-md">
                  <img
                    src={
                      property?.photo?.find(file => !file.isPDF && !file.isVideo)?.url ||
                      "/images/default.jpg"
                    }
                    alt="Property"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div
                    className="absolute bottom-0 left-0 w-full bg-white bg-opacity-95 h-1/3 flex flex-col justify-center px-6 py-2 shadow-inner"
                  >
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

                <div className="w-3/4 flex flex-col justify-between">
                  <ApplicantCard
                    name={`${tenant?.ten_fn || 'Unknown'} ${tenant?.ten_ln || ''}`}
                    desc={app.app_desc || 'N/A'}
                    occupation={employment?.emp_job_title || 'N/A'}
                    status={app.status || 'Pending'}
                    statusIcon={
                      <div className="relative">
                        <button
                          className="px-2 py-1 rounded bg-white text-sm"
                          onClick={() => setStatusMenuAppId(app._id)}
                        >
                          {app.status === 'Approved' ? '✅' : app.status === 'Rejected' ? '❌' : '⏳'}
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

                  {/* SHARED LEASE GROUP MEMBERS */}
                  {group && (
                    <div className="mt-6 bg-purple-100 rounded-lg p-4 max-h-40 overflow-y-auto shadow-md border border-purple-300">
                      <h4 className="font-semibold text-purple-800 mb-3">Shared Lease Group Members</h4>
                      {groupMembers.length > 0 ? (
                        groupMembers.map(member => (
                          <div key={member.ten_id} className="flex items-center gap-3 py-1 border-b border-purple-200 last:border-none">
                            <div className="flex-grow text-purple-900">
                              {member.ten_fn} {member.ten_ln}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-purple-700 italic">No other members in this group.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
