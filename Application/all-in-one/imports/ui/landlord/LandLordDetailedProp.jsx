import React from "react";
import { FaBath, FaBed, FaCar, FaCouch } from "react-icons/fa";
import { useParams } from "react-router-dom";
import Navbar from "./components/LandlordNavbar";
import Footer from "./components/Footer";
import PropertyDetailsCard from "../globalComponents/PropertyDetailsCard";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Properties, Photos, RentalApplications, Videos } from "../../api/database/collections"; // importing mock for now

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This page will display the details of a the landlord's own assigned property listing to the agent (accessed through LandlordProperties) //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default function DetailedPropListing() {
  const { id } = useParams();
    
const { isReady, property, photos, videos, approvedLeaseStart }=  useTracker(()=>{
        const subProps= Meteor.subscribe("properties");
        const subPhotos= Meteor.subscribe("photos");
        const subApps= Meteor.subscribe("rentalApplications");
        const subVideos= Meteor.subscribe("videos")
    
        const isReady= subProps.ready() && subPhotos.ready() && subVideos.ready() && subApps.ready();
  
        let property= null;
        let photos= [];
        let videos = [];
        let approvedLeaseStart=null;
  
        // find property, photos and videos corresponding to the property ID passed.
        if (isReady){
          property= Properties.findOne({prop_id: id});
          photos= Photos.find({prop_id: id}, {sort:{photo_order:1}}).fetch();
          videos = Videos.find({ prop_id: id }).fetch();
        }

        // code for next milestone: display lease date of properties whhich are maked as Leased in Property
        // if (property && property.prop_status==="Leased"){
        //   const approvedApp= RentalApplications.findOne({
        //     prop_id: id,
        //     status: "Approved",
        //   });

        //   if (approvedApp && approvedApp.lease_start_date){
        //     approvedLeaseStart= approvedApp.lease_start_date;
        //   }
        // }
        
        // get lease date of properties with approved tenant
        approvedLeaseStart = RentalApplications.findOne({ 
  prop_id: id, 
  status: "Approved" 
})?.lease_start_date || null;

        return {isReady, property, photos, videos, approvedLeaseStart};
  
    
      }, [id]);
    
      if (!isReady){
        return (<div className="min-h-screen flex items-center justify-center text-xl text-gray-600">Loading Properties...</div>);
      }
  
      if (!property){
        return (<div className="min-h-screen flex items-center justify-center text-xl text-red-600">Property Not Found!</div>);
      }


     // data passed on to propertyDetailsCard
      const propertyData= {
          id: property.prop_id,
          address: property.prop_address,
          price:property.prop_pricepweek,
          type:property.prop_type,
          status: property.prop_status,
          leaseStartDate: approvedLeaseStart,
          AvailableDate: property.prop_available_date,
          Pets: property.prop_pets ? "True":"False",
          imageUrls: photos.length? photos.map((photo)=>photo.photo_url):["/images/default.jpg"],
          videoUrls: videos.length ? videos.map((video) => video.video_url) : null,
          details:{
          beds: property.prop_numbeds ?? "N/A",
          baths: property.prop_numbaths ?? "N/A",
          carSpots: property.prop_numcarspots ?? "N/A",
          furnished: property.prop_furnish? "Yes":"No",
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

      {/*Footer*/}
      <Footer />
    </div>
  );
}
