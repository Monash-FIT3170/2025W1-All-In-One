import React, { useState } from "react";
import { FaBath, FaBed, FaCar, FaCouch } from "react-icons/fa";
import { useParams, Link, UseNavigate } from "react-router-dom";
import Navbar from "./components/AgentNavbar";
import Footer from "./components/Footer";
import PropertyDetailsCard from "../globalComponents/PropertyDetailsCard";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Properties, Photos, Videos, RentalApplications, Landlord } from "../../api/database/collections"; // importing mock for now
import EditPropertyModal from "./components/EditPropertyModal";
import EditMediaModal from "./components/EditMediaModal";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This page will display the details of a the agent's own assigned property listing to the agent (accessed through AgentListings) //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default function AgentDetailedListing() {
  const { id } = useParams();
  const[openEditDetails, setOpenEditDetails] = useState(false);
  const[openEditMedia, setOpenEditMedia] = useState(false);

const { isReady, property, photos, videos, approvedLeaseStart, landlord }=  useTracker(()=>{
        const subProps= Meteor.subscribe("properties");
        const subPhotos= Meteor.subscribe("photos");
        const subApps= Meteor.subscribe("rentalApplications");
        const subVideos = Meteor.subscribe("videos");
        const subLandlords = Meteor.subscribe("landlords");
    
        const isReady= subProps.ready() && subPhotos.ready() && subVideos.ready() && subApps.ready() && subLandlords.ready();
  
        let property= null;
        let photos= [];
        let videos = [];
        let approvedLeaseStart=null;
        let landlord = null;
  
        // find property, photos and videos corresponding to the property ID passed.     
        if (isReady){
          property= Properties.findOne({prop_id: id});
          photos= Photos.find({prop_id: id}, {sort:{photo_order:1}}).fetch();
          videos = Videos.find({ prop_id: id }).fetch();
        }

        
        if (property && property.prop_status==="Leased"){
          const approvedApp= RentalApplications.findOne({
            prop_id: id,
            status: "Approved",
          });

          if (approvedApp && approvedApp.lease_start_date){
            approvedLeaseStart= approvedApp.lease_start_date;
          }
        }

        // get lease date of properties with approved tenant
        // code from milestone 2: display lease date of properties whhich are maked as Leased in Property
        // approvedLeaseStart = RentalApplications.findOne({ 
        //   prop_id: id, 
        //   status: "Approved" 
        // })?.lease_start_date || null;

        // fetch landlord information
                if (property?.landlord_id) {
                  landlord = Landlord.findOne({ ll_id: property.landlord_id });
                }
  
        return {isReady, property, photos, videos, approvedLeaseStart, landlord};
  
    
      }, [id]);
    
      if (!isReady){
        return (<div className="min-h-screen flex items-center justify-center text-xl text-gray-600">Loading Property...</div>);
      }
  
      if (!property){
        return (<div className="min-h-screen flex items-center justify-center text-xl text-red-600">Property Not Found!</div>);
      }


      // derive image URLs from property.photo (Cloudinary) with fallback to Photos collection
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
        : (photos.length ? photos.map((photo) => photo.photo_url) : []))
        || [];

      // data passed on to propertyDetailsCard
      const propertyData= {
          id: property.prop_id,
          address: property.prop_address,
          price:property.prop_pricepweek,
          type:property.prop_type,
          status: property.prop_status,
          leaseStartDate: approvedLeaseStart,
          AvailableDate: property.prop_available_date,
          Pets: property.prop_pets,
          imageUrls: imageUrlsFinal.length ? imageUrlsFinal : ["/images/default.jpg"],
          videoUrls: videos.length ? videos.map((video) => video.video_url) : null,
          details:{
          beds: property.prop_numbeds ?? "N/A",
          baths: property.prop_numbaths ?? "N/A",
          carSpots: property.prop_numcarspots ?? "N/A",
          furnished: property.prop_furnish,
          },
          description: property.prop_desc,
          photo: property.photo,
          bond: property.prop_bond,
          landlord: property.landlord_id,
        };


  return (
    <div className="min-h-screen bg-[#FFF8E9] flex flex-col">
      {/*Header*/}
      <Navbar />

      {/*Main content using propertyDetailsCard*/}
      <div className="max-w-7xl mx-auto w-full px-6">
        <PropertyDetailsCard property={propertyData} />
      </div>

      {/*Description and buttons (no buttons for now (milestone 2)*/}
      <div className="max-w-7xl mx-auto p-6 text-gray-800 text-base leading-relaxed mb-12">
        <div className="p-6 flex space-x-4 mt-4"></div>
        <p className="font-semibold text-lg text-[#434343] text-center">
          {propertyData.description}
        </p>

        <div className="mt-4 w-full flex justify-center">
          <div className="w-[1220px] px-4 py-3 flex justify-center rounded-lg gap-4">
            <button className="w-1/2 bg-[#9747FF] hover:bg-violet-900 text-white font-base text-center py-2 rounded-md shadow-md transition duration-200"
            onClick={() => setOpenEditDetails(true)}>
              Edit Property Details
            </button>
            <button className="w-1/2 bg-[#9747FF] hover:bg-violet-900 text-white font-base text-center py-2 rounded-md shadow-md transition duration-200"
            onClick={() => setOpenEditMedia(true)}>
              Edit Photos/Videos
            </button>
          </div>
        </div>

      </div>

      {/* Agent information */}
      {landlord && (
        <div className="max-w-7xl max-auto p-6 mt-4 rounded shadow-md text-gray-800">
          <h3 className="text-xl font-semibold mb-4">Landlord Information</h3>
          <p>
            <span className="text-1xl text-gray-700">Name: </span> {landlord.ll_fn} {landlord.ll_ln}
          </p>
          <p>
            <span className="text-1xl text-gray-700">Email: </span> {landlord.ll_email}
          </p>
          <p>
            <span className="text-1xl text-gray-700">Phone: </span> {landlord.ll_pn}
          </p>
        </div>
      )}

      {/*Footer*/}
      <Footer />

      {openEditDetails && <EditPropertyModal
      isOpen={() => setOpenEditDetails(true)}
      onClose={() => setOpenEditDetails(false)}
      propertyData={propertyData}/>}

      {openEditMedia && <EditMediaModal
      isOpen={() => setOpenEditMedia(true)}
      onClose={() => setOpenEditMedia(false)}
      propertyData={propertyData}/>}

    </div>
  );
}
