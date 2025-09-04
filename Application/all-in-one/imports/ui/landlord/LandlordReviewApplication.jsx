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
import Navbar from "./components/LandlordNavbar";
import { Link } from "react-router-dom";

export default function ReviewApplication() {
  // State for the search bar
  const [allSearch, setAllSearch] = useState("");
  // State to show/hide the filter menu
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  // Filters
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);
  // Loading tracker
  const [loadingIds, setLoadingIds] = useState({});

  const landlord = Meteor.user();
  const landlordId = landlord?._id;

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

      const properties = Properties.find({ landlord_id: landlordId }).fetch();
      const applications = RentalApplications.find({
        prop_id: { $in: properties.map((p) => p.prop_id) },
        submitted: true, // ✅ Only include submitted applications
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

  // Decision icons for application status
  const landlordFlags = [
    { src: "/images/GreenTick.png", label: "Approved" },
    { src: "/images/red.png", label: "Rejected" },
  ];

  // Handle landlord clicking a decision flag
  const handleLandlordClick = (appId, label) => {
    setLoadingIds((prev) => ({ ...prev, [appId]: true }));

    if (label === "Clear") {
      Meteor.call("rentalApplications.clearLandlordFinal", appId, (err) => {
        setLoadingIds((prev) => ({ ...prev, [appId]: false }));
        if (err) {
          alert("Error clearing landlord decision: " + err.reason);
        }
      });
    } else {
      Meteor.call("rentalApplications.setLandlordFinal", appId, label, (err) => {
        setLoadingIds((prev) => ({ ...prev, [appId]: false }));
        if (err) {
          alert("Error saving landlord decision: " + err.reason);
        }
      });
    }
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
            if (app.status && app.status !== "Pending")
              extraInfoParts.push(formatFlagLabel(app.status));
            const extraInfo = extraInfoParts.join(" • ");

            const currentDecision = app.landLordFinal || null;
            const isLoading = loadingIds[app._id];

            return (
              <div key={app._id} className="flex overflow-hidden gap-8">
                {/* Property image */}
                <div className="relative w-1/4 h-64 rounded-2xl overflow-hidden ">
                  {(() => {
                    // Prefer Cloudinary URLs from property.photo (objects or strings)
                    let firstPhotoUrl;
                    if (property && Array.isArray(property.photo)) {
                      const firstNonVideoPhoto = property.photo.find((item) => {
                        if (typeof item === 'string') return item.trim().length > 0;
                        if (item && typeof item === 'object') {
                          const isNotVideo = item.isVideo === false || item.isVideo === undefined;
                          const isNotPdf = item.isPDF === false || item.isPDF === undefined;
                          return Boolean(item.url) && isNotVideo && isNotPdf;
                        }
                        return false;
                      });
                      if (typeof firstNonVideoPhoto === 'string') {
                        firstPhotoUrl = firstNonVideoPhoto;
                      } else if (firstNonVideoPhoto && typeof firstNonVideoPhoto === 'object') {
                        firstPhotoUrl = firstNonVideoPhoto.url;
                      }
                    }
                    const imgSrc = firstPhotoUrl || "/images/default.jpg";
                    return (
                      <img
                        src={imgSrc}
                        alt="Property"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    );
                  })()}
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
                    agentFlag={app.agentFlag}
                    finaliseButton={null}
                    status={app.landLordFinal || app.status || "Pending"}
                    extraInfo={extraInfo}
                    statusIcon={
                      <div className="flex gap-2 items-center">
                        {currentDecision === null ? (
                          landlordFlags.map((flag) => (
                            <img
                              width={20}
                              height={20}
                              key={flag.label}
                              src={flag.src}
                              alt={flag.label}
                              className={`w-10 h-10 cursor-pointer hover:scale-110 transition ${
                                isLoading ? "opacity-50 cursor-wait" : ""
                              }`}
                              onClick={() =>
                                !isLoading &&
                                handleLandlordClick(app._id, flag.label)
                              }
                            />
                          ))
                        ) : (
                          <div className="flex gap-2 items-center">
                            <img
                              src={
                                landlordFlags.find(
                                  (f) => f.label === currentDecision
                                )?.src
                              }
                              alt={currentDecision}
                              className="w-10 h-10"
                            />
                            <span className="text-sm font-semibold">
                              {currentDecision}
                            </span>
                            <button
                              onClick={() =>
                                !isLoading &&
                                handleLandlordClick(app._id, "Clear")
                              }
                              className="ml-2 text-sm font-semibold text-blue-500 underline"
                              disabled={isLoading}
                            >
                              Change
                            </button>
                          </div>
                        )}
                      </div>
                    }
                  />

                  {/* View Application Button */}
                  <div className="mt-4">
                    <Link
                      to={`/landlord/application/${app._id}`}
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
                        const memberApp = applications.find(
                          (a) =>
                            a.ten_id === member.ten_id &&
                            a.shared_lease_id === app.shared_lease_id
                        );

                        return (
                          <Link
                            key={member.ten_id}
                            to={`/landlord/application/${memberApp?._id}`}
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
