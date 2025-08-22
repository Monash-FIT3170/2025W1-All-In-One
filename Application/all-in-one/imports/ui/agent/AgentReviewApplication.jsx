// ReviewApplication.jsx
import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { ApplicantCard } from "./components/ApplicantCard";
import { useTracker } from "meteor/react-meteor-data";
import {
  RentalApplications,
  Properties,
  Tenants,
  Employment,
} from "/imports/api/database/collections";
import FilterMenu from "./components/FilterMenu";
import StatusMenu from "./components/StatusMenu";
import Navbar from "./components/AgentNavbar";
import { Link } from "react-router-dom";

export default function ReviewApplication() {
  // State for the search bar
  const [allSearch, setAllSearch] = useState("");
  // State to show/hide the filter menu
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  // State to track which application's status menu is open
  const [statusMenuAppId, setStatusMenuAppId] = useState(null);
  // State for selected filters
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);

  const agent = Meteor.user();
  const agentId = agent?._id;

  const { isReady, applications, tenants, properties, employments } =
    useTracker(() => {
      const sub1 = Meteor.subscribe("rentalApplications");
      const sub2 = Meteor.subscribe("properties");
      const sub3 = Meteor.subscribe("tenants");
      const sub4 = Meteor.subscribe("employment");

      const isReady =
        sub1.ready() && sub2.ready() && sub3.ready() && sub4.ready();

      if (!isReady) {
        return {
          isReady: false,
          properties: [],
          applications: [],
          tenants: [],
          employments: [],
        };
      }

      const properties = Properties.find({ agent_id: agentId }).fetch();
      const applications = RentalApplications.find({
        prop_id: { $in: properties.map((p) => p.prop_id) },
      }).fetch();
      const tenants = Tenants.find().fetch();
      const employments = Employment.find().fetch();

      return {
        isReady: true,
        properties,
        applications,
        tenants,
        employments,
      };
    });

  if (!isReady) {
    return <div className="p-8 text-gray-600">Loading applications...</div>;
  }

  const formatFlagLabel = (flag) => {
    if (!flag) return "";
    const f = String(flag).toLowerCase();
    if (f.includes("short")) return "🟢 Shortlisted";
    if (f.includes("review")) return "🟡 To be Reviewed";
    if (f.includes("flag")) return "🔴 Flagged";
    return flag;
  };

  const filteredApplications = applications.filter((app) => {
    const tenant = tenants.find((t) => t.ten_id === app.ten_id);
    const property = properties.find((p) => p.prop_id === app.prop_id);

    const tenantName = `${tenant?.ten_fn || ""} ${
      tenant?.ten_ln || ""
    }`.toLowerCase();
    const propertyAddress = (property?.prop_address || "").toLowerCase();
    const searchTerm = allSearch.toLowerCase();

    const matchStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(app.status);
    const matchApplicant =
      selectedApplicants.length === 0 ||
      selectedApplicants.includes(app.ten_id);
    const matchProperty =
      selectedProperties.length === 0 ||
      selectedProperties.includes(app.prop_id);

    return (
      matchStatus &&
      matchApplicant &&
      matchProperty &&
      (tenantName.includes(searchTerm) || propertyAddress.includes(searchTerm))
    );
  });

  const approveApplicantFinal = (appId, propId) => {
    if (!propId) {
      alert("Property ID is missing");
      return;
    }

    if (
      !confirm(
        "Mark this applicant as final (this will reject other applications for the property)?"
      )
    ) {
      return;
    }

    Meteor.call("setFinalDecision", propId, appId, (err) => {
      if (err) {
        alert("Error approving: " + (err.reason || err.message || err));
      } else {
        alert("Applicant approved successfully.");
      }
    });
  };

  return (
    <div className="bg-[#FFF8EB] min-h-screen pb-20">
      <Navbar />
      <div className="px-12 py-8">
        <h2 className="text-2xl font-semibold">Review Applications</h2>
        <p className="text-sm text-gray-600">All applications in one place!</p>
        <hr
          style={{
            color: "#000000",
            backgroundColor: "#000000",
            height: 0.5,
            borderColor: "#000000",
          }}
          className="my-4"
        />

        {/* Search bar and filter button */}
        <div className="mt-4 bg-[#CBADD8] px-6 py-4 rounded-lg flex gap-4 relative">
          <input
            type="text"
            placeholder="Search Applicant..."
            className="flex-1 px-4 py-2 rounded-md"
            style={{ backgroundColor: "#FFF8E9" }}
            value={allSearch}
            onChange={(e) => setAllSearch(e.target.value)}
          />
          <button
            className="w-1/5 px-4 py-2 rounded-md text-white"
            style={{ backgroundColor: "#9747FF" }}
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

        {/* Applications Grid */}
        <div className="grid grid-cols-1 gap-6 mt-6 ">
          {filteredApplications.map((app) => {
            const tenant = tenants.find((t) => t.ten_id === app.ten_id);
            const property = properties.find((p) => p.prop_id === app.prop_id);
            const employment = employments.find(
              (e) => e.employment_id === app.employment_id
            );

            const relatedApplications = applications.filter(
              (otherApp) =>
                otherApp._id !== app._id &&
                otherApp.shared_lease_id &&
                otherApp.shared_lease_id === app.shared_lease_id
            );

            const relatedTenants = relatedApplications
              .map((ra) => tenants.find((t) => t.ten_id === ra.ten_id))
              .filter(Boolean);

            const extraInfoParts = [];
            if (app.landlordFeedback)
              extraInfoParts.push(`Landlord: ${app.landlordFeedback}`);
            if (app.landlordFlag)
              extraInfoParts.push(formatFlagLabel(app.landlordFlag));
            const extraInfo = extraInfoParts.join(" • ");

            return (
              <div key={app._id} className="flex overflow-hidden gap-8">
                {/* Property image */}
                <div className="relative w-1/4 h-64 rounded-2xl overflow-hidden ">
                  <img
                    src={
                      property?.prop_id
                        ? `/images/properties/${property.prop_id}/main.jpg`
                        : "/images/default.jpg"
                    }
                    alt="Property"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div
                    className="absolute bottom-0 left-0 w-full"
                    style={{ height: "35%" }}
                  >
                    <div className="bg-white bg-opacity-95 h-full flex flex-col justify-center px-6 py-2 shadow-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                          ${app.app_rent} per week
                        </span>
                        <span className="text-sm font-semibold text-gray-700 truncate">
                          {property?.prop_address || "Unknown address"}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-1 text-gray-700 text-md">
                        <span className="flex items-center gap-1">
                          🛏 {property?.prop_numbeds || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          🛁 {property?.prop_numbaths || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          🚗 {property?.prop_numcarspots || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Applicant Info Card */}
                <div className="w-3/4 p-8 bg-[#CBADD8] rounded-2xl flex flex-col justify-between">
                  <ApplicantCard
                    name={`${tenant?.ten_fn || "Unknown"} ${
                      tenant?.ten_ln || ""
                    }`}
                    desc={app.app_desc || "N/A"}
                    age={
                      tenant?.ten_dob
                        ? Math.floor(
                            (new Date() - new Date(tenant.ten_dob)) /
                              (1000 * 60 * 60 * 24 * 365.25)
                          )
                        : "N/A"
                    }
                    finaliseButton={
                      <div className="flex items-center gap-2">
                        {app.finalDecision === "Approved" && (
                          <span
                            title="Final Decision: Approved"
                            className="text-green-600 text-xl"
                          >
                            <img
                              src="/icons/Frame31.png"
                              alt="Green Flag"
                              width={20}
                              height={20}
                            />
                          </span>
                        )}
                        {app.finalDecision === "Rejected" && (
                          <span
                            title="Final Decision: Rejected"
                            className="text-red-600 text-xl"
                          >
                            <img
                              src="/icons/Frame32.png"
                              alt="Red Flag"
                              width={20}
                              height={20}
                            />
                          </span>
                        )}
                        {!app.finalDecision && (
                          <button
                            onClick={() =>
                              approveApplicantFinal(app._id, app.prop_id)
                            }
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                          >
                            Select as Tenant (Final)
                          </button>
                        )}
                      </div>
                    }
                    status={app.status || "Pending"}
                    extraInfo={extraInfo}
                    statusIcon={
                      <div className="relative flex items-center gap-3">
                        <button
                          className="px-2 py-1 rounded bg-white text-sm"
                          onClick={() => setStatusMenuAppId(app._id)}
                        >
                          {app.status === "Shortlisted"
                            ? "🟢"
                            : app.status === "Flagged"
                            ? "🔴"
                            : app.status == "Approved"
                            ? "✅"
                            : app.status == "Rejected"
                            ? "❌"
                            : "⏳"}
                        </button>
                        <StatusMenu
                          show={statusMenuAppId === app._id}
                          onClose={() => setStatusMenuAppId(null)}
                          onAccept={() => {
                            Meteor.call(
                              "rentalApplications.setStatus",
                              app._id,
                              "Shortlisted"
                            );
                            setStatusMenuAppId(null);
                          }}
                          onReject={() => {
                            Meteor.call(
                              "rentalApplications.setStatus",
                              app._id,
                              "Flagged"
                            );
                            setStatusMenuAppId(null);
                          }}
                          status={app.status}
                        />
                      </div>
                    }
                  />

                  {/* View Application Button */}
                  <div className="mt-4">
                    <Link
                      to={`/agent/application/${app._id}`}
                      className="inline-block bg-white text-purple-700 font-semibold px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition"
                    >
                      View Application
                    </Link>
                  </div>

                  {/* Shared Lease Members */}
                  {relatedTenants.length > 0 && (
                    <div className="mt-4 bg-white bg-opacity-80 rounded p-3 h-auto text-gray-800">
                      <h4 className="font-semibold mb-2">
                        Shared Lease Group Members:
                      </h4>
                      {relatedTenants.map((member) => {
                        // Find the application belonging to this related member
                        const memberApp = applications.find(
                          (a) => a.ten_id === member.ten_id && a.shared_lease_id === app.shared_lease_id
                        );

                        return (
                          <Link
                            key={member.ten_id}
                            to={`/agent/application/${memberApp?._id}`}
                            className="block py-1 px-2 bg-white rounded-md shadow-sm mb-1 hover:bg-purple-50 cursor-pointer"
                          >
                            {member.ten_fn} {member.ten_ln}
                          </Link>
                        );
                      })}
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
