import React from "react";
import { FaBath, FaBed, FaCar, FaCouch } from "react-icons/fa";
import { useParams } from "react-router-dom";
import Navbar from "./components/LandlordNavbar";
import Footer from "./components/Footer";
import PropertyDetailsCard from "../globalComponents/PropertyDetailsCard";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Properties, Photos, RentalApplications, Videos, Agents, Tenants } from "../../api/database/collections"; // importing mock for now

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This page will display the details of a property to the landlord (accessed through the LandlordBasicPropListing page) //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Utility function to get tenant name
function getTenantName(tenantId) {
  const tenant = Tenants.findOne({ ten_id: tenantId });
  return tenant ? `${tenant.first_name} ${tenant.last_name}` : "Unknown Tenant";
}

export default function LandlordDetailedPropListing() {
  const { id } = useParams();

  // Subscribe to applications for this property
  const applications = useTracker(() => {
    const handle = Meteor.subscribe("rentalApplications.byProperty", id);
    if (!handle.ready()) return [];
    return RentalApplications.find({ prop_id: id }).fetch();
  }, [id]);

  const [feedbackText, setFeedbackText] = React.useState("");
  const [rating, setRating] = React.useState("");
    
const { isReady, property, photos, videos, approvedLeaseStart, agent, tenant }=  useTracker(()=>{
        const subProps= Meteor.subscribe("properties");
        const subPhotos= Meteor.subscribe("photos");
        const subApps= Meteor.subscribe("rentalApplications");
        const subVideos= Meteor.subscribe("videos")
        const subAgents= Meteor.subscribe("agents");
        const subTenants= Meteor.subscribe("tenants");
    
        const isReady= subProps.ready() && subPhotos.ready() && subVideos.ready() && subApps.ready() && subAgents.ready() && subTenants.ready();
  
        let property= null;
        let photos= [];
        let videos = [];
        let approvedLeaseStart=null;
        let agent= null;
        let tenant = null;
  
        // find property, photos and videos corresponding to the property ID passed.
        if (isReady){
          property= Properties.findOne({prop_id: id});
          photos= Photos.find({prop_id: id}, {sort:{photo_order:1}}).fetch();
          videos = Videos.find({ prop_id: id }).fetch();
        

        
        if (property){
          const approvedApp= RentalApplications.findOne({
            prop_id: id,
            landLordFinal: "Approved",
          });

          if (approvedApp){
            approvedLeaseStart= approvedApp.lease_start_date || null;
            tenant = Tenants.findOne({ ten_id: approvedApp.ten_id });
          }
        }
        
        
        // code from milestone2: 
        // get lease date of properties with approved tenant
//         approvedLeaseStart = RentalApplications.findOne({ 
//   prop_id: id, 
//   status: "Approved" 
// })?.lease_start_date || null;

        // fetch agent information
        if (property?.agent_id) {
          agent = Agents.findOne({ agent_id: property.agent_id });
        }
      }
      

        return {isReady, property, photos, videos, approvedLeaseStart, agent, tenant};
  
    
      }, [id]);
    
      if (!isReady){
        return (<div className="min-h-screen flex items-center justify-center text-xl text-gray-600">Loading Properties...</div>);
      }
  
      if (!property){
        return (<div className="min-h-screen flex items-center justify-center text-xl text-red-600">Property Not Found!</div>);
      }

  // data passed on to propertyDetailsCard
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
    Pets: property.prop_pets ? "True" : "False",
    imageUrls: imageUrlsFinal.length ? imageUrlsFinal : ["/images/default.jpg"],
    videoUrls: videos.length ? videos.map((video) => video.video_url) : [],
    details: {
      beds: property.prop_numbeds ?? "N/A",
      baths: property.prop_numbaths ?? "N/A",
      carSpots: property.prop_numcarspots ?? "N/A",
      furnished: property.prop_furnish ? "Yes" : "No",
    },
    description: property.prop_desc,
  };

  return (
    <div className="min-h-screen bg-[#FFF8E9] flex flex-col">
      {/*Header*/}
      <Navbar />

      {/*Main content*/}
      <div className="max-w-7xl mx-auto w-full px-6">
        <PropertyDetailsCard property={propertyData} />
      </div>

      {/*Description and buttons*/}
      <div className="max-w-7xl mx-auto p-6 text-gray-800 text-base leading-relaxed mb-12">
        <p className="font-semibold text-lg text-[#434343]">
          {propertyData.description}
        </p>
      </div>

      {/* Agent information */}
      {agent && (
        <div className="p-6 text-gray-800 text-base leading-relaxed mb-12">
          <h3 className="text-xl font-semibold mb-4">Agent Information</h3>
          <p>
            <span className="text-1xl text-gray-700">Name: </span> {agent.agent_fname} {agent.agent_lname}
          </p>
          <p>
            <span className="text-1xl text-gray-700">Email: </span> {agent.agent_email}
          </p>
          <p>
            <span className="text-1xl text-gray-700">Phone: </span> {agent.agent_ph}
          </p>
        </div>
      )}

      {/* Tenant Information */}
      {tenant && (
        <div className="p-6 text-gray-800 text-base leading-relaxed mb-12">
          <h3 className="text-xl font-semibold mb-4">Tenant Information</h3>
          <p><span className="font-medium">Name: </span> {tenant.ten_fn} {tenant.ten_ln}</p>
          <p><span className="font-medium">Email: </span> {tenant.ten_email}</p>
          <p><span className="font-medium">Phone: </span> {tenant.ten_pn}</p>
          {approvedLeaseStart && (
            <p><span className="font-medium">Lease Start Date: </span> {new Date(approvedLeaseStart).toLocaleDateString()}</p>
          )}
        </div>
      )}


      {/* Feedback Form */}
      <div className="max-w-7xl mx-auto p-6 text-gray-800">
        <h3 className="text-lg font-semibold mb-2">Leave Feedback</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // console.log("Feedback text:", feedbackText);
            // console.log("Rating:", rating);

            // Send the feedback to the server
            Meteor.call("updateFeedback", id, feedbackText, rating, (err) => {
              if (err) {
                alert("Error saving feedback: " + err.reason);
              } else {
                alert("Feedback saved successfully!");
                setFeedbackText("");
                setRating("Shortlisted");
              }
            });
          }}
          className="space-y-4"
        >
          <input
            type="text"
            placeholder="Enter your feedback"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="">-Select rating-</option>
            <option value="Shortlisted">🟢 Shortlisted</option>
            <option value="To be Reviewed">🟡 To be Reviewed</option>
            <option value="Flagged">🔴 Flagged</option>
          </select>
          <button className="flex justify-center bg-[#9747FF] hover:bg-[#7d3dd1] text-white px-4 py-2 rounded-md">
            Submit
          </button>
        </form>

        {/* Applications List */}
        <div className="mt-6">
          {applications.map((app) => (
            <div key={app.rental_app_id} className="flex items-center gap-2">
              <span>{getTenantName(app.ten_id)}</span>
              {app.finalDecision === "Approved" && (
                <span className="text-green-500 text-lg">✔</span>
              )}
              {app.finalDecision === "Rejected" && (
                <span className="text-red-500 text-lg">✘</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/*Footer*/}
      <Footer />
    </div>
  );
}

