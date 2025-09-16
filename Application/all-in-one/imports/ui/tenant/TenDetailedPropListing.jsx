import React, { useState } from "react";
import { FaBath, FaBed, FaCar, FaCouch } from "react-icons/fa";
import { HiOutlineInformationCircle } from "react-icons/hi"; 
import { useParams, Link } from "react-router-dom";
import Navbar from "./components/TenNavbar";
import Footer from "./components/Footer";
import PropertyDetailsCard from "../globalComponents/PropertyDetailsCard";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Properties, Photos, Videos, AgentAvailabilities, StarredProperties, Agents } from "../../api/database/collections"; // importing mock for now
import UpcomingOpenHouseModal from "./components/UpcomingOpenHouseModal";

///////////////////////////////////////////////////////////////////////////////////////////////////////
// This page will display the details of a listed property (accessed through TenantBasicPropListing) //
///////////////////////////////////////////////////////////////////////////////////////////////////////

export default function TenDetailedPropListing() {

  const [openModal, setOpenModal] = useState(false);
  const [showEstimateHelp, setShowEstimateHelp] = useState(false);
  const { id } = useParams();
  console.log("propId received:", id);
  
  const { isReady, property, photos, videos, openHouses, starredProperties, agent}=  useTracker(()=>{
    const tenantID = Meteor.userId();
    const subProps = Meteor.subscribe("properties");
    const subPhotos = Meteor.subscribe("photos");
    const subVideos = Meteor.subscribe("videos");
    const subAvailabilities = Meteor.subscribe("allAvailableInspections")
    const subStarred = Meteor.subscribe("starredProperties"); 
    const subAgents= Meteor.subscribe("agents");

    const isReady= subProps.ready() && subPhotos.ready() && subVideos.ready() && subAvailabilities.ready() && subStarred.ready() && subAgents.ready();

    let property= null;
    let photos= [];
    let videos=[];
    let openHouses = [];
    let starredProperties = [];
    let agent= null;

    // find property, photos and videos corresponding to the property ID passed.
    if (isReady){
      property= Properties.findOne({prop_id: id});
      photos= Photos.find({prop_id: id}, {sort:{photo_order:1}}).fetch();
      videos= Videos.find({prop_id: id}).fetch();
      starredProperties = StarredProperties.find({ten_id: tenantID, prop_id: id}).fetch();
      openHouses = AgentAvailabilities.find({type: "Open House", is_private: false}).fetch();
      openHouses = openHouses.filter((p) => p.property.address === property.prop_address);
      if (property?.agent_id){
              agent= Agents.findOne({agent_id: property.agent_id});
            }
    }

    return {isReady, property, photos, videos, openHouses, starredProperties, agent};
  }, [id]);

  if (!isReady){
    return (<div className="min-h-screen flex items-center justify-center text-xl text-gray-600">Loading Properties...</div>);
  }

  if (!property){
    return (<div className="min-h-screen flex items-center justify-center text-xl text-red-600">Property Not Found!</div>);
  }

  const isStarred = starredProperties.length>0;
    
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

  // data passed on to propertyDetailsCard
  const propertyData= {
    id: property.prop_id,
    address: property.prop_address,
    price:property.prop_pricepweek,
    type:property.prop_type,
    AvailableDate: property.prop_available_date,
    Pets: property.prop_pets,
    imageUrls: imageUrlsFinal.length ? imageUrlsFinal : ["/images/default.jpg"],
    videoUrls: videos.length ? videos.map((video) => video.video_url) : [],
    details:{
      beds: property.prop_numbeds ?? "N/A",
      baths: property.prop_numbaths ?? "N/A",
      carSpots: property.prop_numcarspots ?? "N/A",
      furnished: property.prop_furnish,
    },
    description: property.prop_desc,
    starred: isStarred,
  };

  const tenantID = Meteor.userId()
  console.log(tenantID)

  return (
    <div className="min-h-screen bg-[#FFF8E9] flex flex-col">
      {/*Header*/}
      <Navbar />

      {/*Main content and buttons*/}
      <div className="max-w-7xl mx-auto w-full px-6">

        {/* Price Estimate badge */} 
        <div className="pt-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#DCC9E4] px-4 py-2 shadow-sm ring-1 ring-black/5">
            <span className="text-sm font-semibold text-gray-800">Price Estimate:</span>
            <span className="text-sm font-bold text-[#2E2E2E]">Unavailable</span>
            <button
              type="button"
              aria-label="Price estimate unavailable"
              onMouseEnter={() => setShowEstimateHelp(true)}
              onMouseLeave={() => setShowEstimateHelp(false)}
              onFocus={() => setShowEstimateHelp(true)}
              onBlur={() => setShowEstimateHelp(false)}
              className="ml-1 text-gray-600 hover:text-gray-800"
            >
              <HiOutlineInformationCircle className="h-5 w-5" />
            </button>
          </div>

          {showEstimateHelp && (
            <div className="relative">
              <div className="absolute z-10 mt-2 w-72 rounded-lg bg-white p-3 text-xs text-gray-700 shadow-lg ring-1 ring-black/10">
                Price estimation is currently unavailable for this property.
              </div>
            </div>
          )}
        </div>
        {/* End Price Estimate badge */}

        <PropertyDetailsCard property={propertyData} showSaveButton={true} />
        <div className="w-full flex flex-row gap-4 mb-8 pt-10">

          <button className="w-1/2 bg-[#9747FF] hover:bg-violet-900 text-white font-base text-center py-2 rounded-md shadow-md transition duration-200"
          onClick={() => setOpenModal(true)}
          key={propertyData}>
            Open House Availabilities
          </button>

          <Link
          key={id}
          to={`/Apply/${id}?tenantId=${tenantID}`} // TBD: replace with actual link to application page
          className="w-1/2 bg-[#9747FF] hover:bg-violet-900 text-white font-base text-center py-2 rounded-md shadow-md transition duration-200"
          >Apply 
          </Link>

          {typeof rentalApp !== 'undefined' && rentalApp ? (
            rentalApp.status === "Approved" ? (
              <button
                disabled
                className="w-1/2 bg-gray-300 text-gray-500 font-base text-center py-2 rounded-md shadow-md cursor-not-allowed"
              >
                Application Approved
              </button>
            ) : rentalApp.status === "Rejected" ? (
              <button
                disabled
                className="w-1/2 bg-gray-300 text-gray-500 font-base text-center py-2 rounded-md shadow-md cursor-not-allowed"
              >
                Application Rejected
              </button>
            ) : rentalApp.submitted === true ? (
              <button
                disabled
                className="w-1/2 bg-gray-300 text-gray-500 font-base text-center py-2 rounded-md shadow-md cursor-not-allowed"
              >
                Application Submitted
              </button>
            ) : null
          ) : null}
        </div>
      </div>

      {/*Description*/}
      <div className="max-w-7xl mx-auto p-6 text-gray-800 text-base leading-relaxed mb-12">
        <p className="font-semibold text-lg text-[#434343]">
          {property.prop_desc}
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
        </div>
      )}

      {/*Footer*/}
      <Footer />

      {openModal && <UpcomingOpenHouseModal 
      isOpen={() => setOpenModal(true)}
      onClose={() => setOpenModal(false)}
      propertyData={propertyData}
      openHouses={openHouses}/> }
    </div>
  );
}
