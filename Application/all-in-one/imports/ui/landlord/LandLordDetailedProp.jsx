import React from "react";
import { FaBath, FaBed, FaCar, FaCouch } from "react-icons/fa";
import { useParams, Link } from "react-router-dom";
import Navbar from "./components/LandlordNavbar";
import Footer from "./components/Footer";
import PropertyDetailsCard from "../globalComponents/PropertyDetailsCard";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Properties, Photos, RentalApplications, Videos, Agents, Tenants } from "../../api/database/collections"; // importing mock for now
import { ApplicantCard } from "./components/ApplicantCard";

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This page will display the details of a property to the landlord (accessed through the LandlordBasicPropListing page) //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Utility function to get tenant name (adjust fields to match your Tenants schema)
function getTenantName(tenantId) {
  const tenant = Tenants.findOne({ ten_id: tenantId });
  if (!tenant) return "Unknown Tenant";
  // adapt to your tenant fields — common patterns: ten_fn / ten_ln
  return `${tenant.ten_fn ?? tenant.first_name ?? ""} ${tenant.ten_ln ?? tenant.last_name ?? ""}`.trim() || "Unknown Tenant";
}

export default function LandlordDetailedPropListing() {
  const { id } = useParams();

  // defensive defaults for things referenced later but not defined in this file
  // replace these with real values/logic from your app
  const landlordFlags = React.useMemo(() => [
    // example placeholder flags (replace with your real flag objects { label, src })
    { label: "Approve", src: "/icons/approve.svg" },
    { label: "Reject", src: "/icons/reject.svg" },
  ], []);
  const [loadingIds] = React.useState({}); // map of appId => boolean while action in progress
  const handleLandlordClick = (appId, flagLabel) => {
    // placeholder handler: replace with real implementation that calls a Meteor method
    console.log("handleLandlordClick", appId, flagLabel);
  };
  const formatFlagLabel = (s) => s;

  // Subscribe to applications for this property (reactive short list)
  const applications = useTracker(() => {
    const handle = Meteor.subscribe("rentalApplications.byProperty", id);
    if (!handle.ready()) return [];
    return RentalApplications.find({ prop_id: id }).fetch();
  }, [id]);

  // page-level state
  const [feedbackText, setFeedbackText] = React.useState("");
  const [rating, setRating] = React.useState("");

  // Main data tracker: properties, photos, videos, agents, tenants, and a single sample application (applicationsTest)
  const {
    isReady,
    property,
    photos,
    videos,
    approvedLeaseStart,
    agent,
    tenant,
    applicationsTest,
    tenantsList,
    propertiesList
  } = useTracker(() => {
    const subProps = Meteor.subscribe("properties");
    const subPhotos = Meteor.subscribe("photos");
    const subApps = Meteor.subscribe("rentalApplications");
    const subVideos = Meteor.subscribe("videos");
    const subAgents = Meteor.subscribe("agents");
    const subTenants = Meteor.subscribe("tenants");

    const ready = subProps.ready() && subPhotos.ready() && subVideos.ready() && subApps.ready() && subAgents.ready() && subTenants.ready();

    let property = null;
    let photos = [];
    let videos = [];
    let approvedLeaseStart = null;
    let agent = null;
    let tenant = null;
    let applicationsTest = null;

    // defensive lists for client-side lookups used when rendering many applications
    const tenantsList = Tenants.find().fetch ? Tenants.find().fetch() : [];
    const propertiesList = Properties.find().fetch ? Properties.find().fetch() : [];

    const landlordId = Meteor.user()?._id;

    if (ready) {
      property = Properties.findOne({ prop_id: id }) || null;
      photos = Photos.find({ prop_id: id }, { sort: { photo_order: 1 } }).fetch();
      videos = Videos.find({ prop_id: id }).fetch();

      if (property) {
        applicationsTest = RentalApplications.findOne({
          prop_id: id,
          landlord_id: landlordId,
        }) || null;
      }

      // example: if you want tenant object for an approved application
      if (applicationsTest?.ten_id) {
        tenant = Tenants.findOne({ ten_id: applicationsTest.ten_id }) || null;
      }

      if (property?.agent_id) {
        agent = Agents.findOne({ agent_id: property.agent_id }) || null;
      }

      // If you have an approved lease date stored on an application:
      approvedLeaseStart = RentalApplications.findOne({ prop_id: id, status: "Approved" })?.lease_start_date || null;
    }

    return { isReady: ready, property, photos, videos, approvedLeaseStart, agent, tenant, applicationsTest, tenantsList, propertiesList };
  }, [id]);

  // safe logging
  React.useEffect(() => {
    console.log("applications (list):", applications);
    console.log("applicationsTest (single):", applicationsTest);
  }, [applications, applicationsTest]);

  if (!isReady) {
    return (<div className="min-h-screen flex items-center justify-center text-xl text-gray-600">Loading Properties...</div>);
  }

  if (!property) {
    return (<div className="min-h-screen flex items-center justify-center text-xl text-red-600">Property Not Found!</div>);
  }

  // Build image URLs from property.photo (Cloudinary) with fallback to Photos
  const imageUrlsFromProperty = Array.isArray(property.photo)
    ? property.photo
      .filter((item) => {
        if (typeof item === 'string') return item.trim().length > 0;
        if (item && typeof item === 'object') {
          const isNotVideo = item.isVideo === false || item.isVideo === undefined;
          const isNotPdf = item.isPDF === false || item.isPDF === undefined;
          return Boolean(item.url) && isNotVideo && isNotPdf;
        }
        return false;
      })
      .map((item) => (typeof item === 'string' ? item : item.url))
    : [];

  const imageUrlsFinal = (imageUrlsFromProperty.length
    ? imageUrlsFromProperty
    : (photos.length ? photos.map((photo) => photo.photo_url) : [])) || [];

  const propertyData = {
    id: property.prop_id,
    address: property.prop_address,
    price: property.prop_pricepweek,
    type: property.prop_type,
    AvailableDate: property.prop_available_date,
    Pets: property.prop_pets,
    imageUrls: imageUrlsFinal.length ? imageUrlsFinal : ["/images/default.jpg"],
    videoUrls: videos.length ? videos.map((video) => video.video_url) : [],
    details: {
      beds: property.prop_numbeds ?? "N/A",
      baths: property.prop_numbaths ?? "N/A",
      carSpots: property.prop_numcarspots ?? "N/A",
      furnished: property.prop_furnish,
    },
    description: property.prop_desc,
  };

  return (
    <div className="min-h-screen bg-[#FFF8E9] flex flex-col">
      {/* Header */}
      <Navbar />

      {/* Main content */}
      <div className="max-w-7xl mx-auto w-full px-6">
        <PropertyDetailsCard property={propertyData} />
      </div>

      {/* Description */}
      <div className="max-w-7xl mx-auto p-6 text-gray-800 text-base leading-relaxed mb-12">
        <p className="font-semibold text-lg text-[#434343] whitespace-pre-line">
          {propertyData.description}
        </p>
      </div>

      {/* Agent information */}
      {agent && (
        <div className="p-6 text-gray-800 text-base leading-relaxed mb-12">
          <h3 className="text-xl font-semibold mb-4">Agent Information</h3>
          <p><span className="text-1xl text-gray-700">Name: </span> {agent.agent_fname} {agent.agent_lname}</p>
          <p><span className="text-1xl text-gray-700">Email: </span> {agent.agent_email}</p>
          <p><span className="text-1xl text-gray-700">Phone: </span> {agent.agent_ph}</p>
        </div>
      )}

      {/* Tenant Information */}
      {tenant && (
        <div className="p-6 text-gray-800 text-base leading-relaxed mb-12">
          <h3 className="text-xl font-semibold mb-4">Tenant Information</h3>
          <p><span className="font-medium">Name: </span> {tenant.ten_fn ?? tenant.ten_fn} {tenant.ten_ln ?? tenant.ten_ln}</p>
          <p><span className="font-medium">Email: </span> {tenant.ten_email}</p>
          <p><span className="font-medium">Phone: </span> {tenant.ten_pn}</p>
          {approvedLeaseStart && (
            <p><span className="font-medium">Lease Start Date: </span> {new Date(approvedLeaseStart).toLocaleDateString()}</p>
          )}
        </div>
      )}

      {/* Applications list */}
      <div className="grid grid-cols-1 gap-6 mt-6 ">
        {applications.map((app) => {
          // use lists fetched in the main tracker to avoid extra DB calls in render
          const tenantObj = tenantsList.find((t) => t.ten_id === app.ten_id) || null;
          const propertyObj = propertiesList.find((p) => p.prop_id === app.prop_id) || null;

          const relatedApplications = applications.filter(
            (otherApp) =>
              otherApp._id !== app._id &&
              otherApp.shared_lease_id &&
              otherApp.shared_lease_id === app.shared_lease_id
          );

          const relatedTenants = relatedApplications
            .map((ra) => tenantsList.find((t) => t.ten_id === ra.ten_id))
            .filter(Boolean);

          const extraInfoParts = [];
          if (app.landlordFeedback) extraInfoParts.push(`Landlord: ${app.landlordFeedback}`);
          if (app.status && app.status !== "Pending") extraInfoParts.push(formatFlagLabel(app.status));
          const extraInfo = extraInfoParts.join(" • ");

          const currentDecision = app.landLordFinal ?? null;
          const isLoading = !!loadingIds[app._id];

          // pick a first photo from the propertyObj or fallback
          let firstPhotoUrl = null;
          if (propertyObj && Array.isArray(propertyObj.photo)) {
            const firstNonVideo = propertyObj.photo.find((item) => {
              if (typeof item === "string") return item.trim().length > 0;
              if (item && typeof item === "object") {
                const isNotVideo = item.isVideo === false || item.isVideo === undefined;
                const isNotPdf = item.isPDF === false || item.isPDF === undefined;
                return Boolean(item.url) && isNotVideo && isNotPdf;
              }
              return false;
            });
            if (typeof firstNonVideo === "string") firstPhotoUrl = firstNonVideo;
            else if (firstNonVideo && typeof firstNonVideo === "object") firstPhotoUrl = firstNonVideo.url;
          }

          const imgSrc = firstPhotoUrl || "/images/default.jpg";

          return (
            <div key={app._id} className="flex overflow-hidden gap-8">
              {/* Property image */}
              <div className="relative w-1/4 h-64 rounded-2xl overflow-hidden ">
                <img src={imgSrc} alt="Property" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 w-full" style={{ height: "35%" }}>
                  <div className="bg-white bg-opacity-95 h-full flex flex-col justify-center px-6 py-2 shadow-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">${app.app_rent} per week</span>
                      <span className="text-sm font-semibold text-gray-700 truncate">{propertyObj?.prop_address || "Unknown address"}</span>
                    </div>
                    <div className="flex gap-4 mt-1 text-gray-700 text-md">
                      <span className="flex items-center gap-1">🛏 {propertyObj?.prop_numbeds || 0}</span>
                      <span className="flex items-center gap-1">🛁 {propertyObj?.prop_numbaths || 0}</span>
                      <span className="flex items-center gap-1">🚗 {propertyObj?.prop_numcarspots || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Applicant Info Card */}
              <div className="w-3/4 p-8 bg-[#CBADD8] rounded-2xl flex flex-col justify-between">
                <ApplicantCard
                  name={`${tenantObj?.ten_fn || "Unknown"} ${tenantObj?.ten_ln || ""}`}
                  desc={app.app_desc || "N/A"}
                  age={
                    tenantObj?.ten_dob
                      ? Math.floor((new Date() - new Date(tenantObj.ten_dob)) / (1000 * 60 * 60 * 24 * 365.25))
                      : "N/A"
                  }
                  agentFlag={app.agentFlag}
                  finaliseButton={null}
                  status={currentDecision || app.status || "Pending"}
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
                            className={`w-10 h-10 cursor-pointer hover:scale-110 transition ${isLoading ? "opacity-50 cursor-wait" : ""}`}
                            onClick={() => !isLoading && handleLandlordClick(app._id, flag.label)}
                          />
                        ))
                      ) : (
                        <div className="flex gap-2 items-center">
                          <img src={landlordFlags.find((f) => f.label === currentDecision)?.src} alt={currentDecision} className="w-10 h-10" />
                          <span className="text-sm font-semibold">{currentDecision}</span>
                          <button
                            onClick={() => !isLoading && handleLandlordClick(app._id, "Clear")}
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
                  <Link to={`/landlord/application/${app._id}`} className="inline-block bg-white text-purple-700 font-semibold px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition">
                    View Application
                  </Link>
                </div>

                {/* Shared Lease Members */}
                {relatedTenants.length > 0 && (
                  <div className="mt-4 bg-white bg-opacity-80 rounded p-3 h-auto text-gray-800">
                    <h4 className="font-semibold mb-2">Shared Lease Group Members:</h4>
                    {relatedTenants.map((member) => {
                      const memberApp = applications.find((a) => a.ten_id === member.ten_id && a.shared_lease_id === app.shared_lease_id);
                      return (
                        <Link key={member.ten_id} to={`/landlord/application/${memberApp?._id}`} className="block py-1 px-2 bg-white rounded-md shadow-sm mb-1 hover:bg-purple-50 cursor-pointer">
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

      {/* Footer */}
      <Footer />
    </div>
  );
}
