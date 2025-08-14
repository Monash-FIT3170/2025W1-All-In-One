import React, { useState } from "react";
import { FaBath, FaBed, FaCar, FaCouch } from "react-icons/fa";
import { useParams } from "react-router-dom";
import Navbar from "./components/TenNavbar";
import Footer from "./components/Footer";
import PropertyDetailsCard from "../globalComponents/PropertyDetailsCard";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Properties, Photos, Videos } from "../../api/database/collections"; // importing mock for now
import { Link } from "react-router-dom";
import UpcomingOpenHouseModal from "./components/UpcomingOpenHouseModal";
import { AgentAvailabilities } from "../../api/AgentAvailabilities";

///////////////////////////////////////////////////////////////////////////////////////////////////////
// This page will display the details of a listed property (accessed through TenantBasicPropListing) //
///////////////////////////////////////////////////////////////////////////////////////////////////////

export default function TenDetailedPropListing() {
    
    const[openModal, setOpenModal] = useState(false);

    const { id } = useParams();
    console.log("propId received:", id);
    const { isReady, property, photos, videos, openHouses}=  useTracker(()=>{
        const subProps= Meteor.subscribe("properties");
        const subPhotos= Meteor.subscribe("photos");
        const subVideos= Meteor.subscribe("videos");
        const subAvailabilities = Meteor.subscribe("agentAvailabilities")

        const isReady= subProps.ready() && subPhotos.ready() && subVideos.ready() && subAvailabilities.ready();

        let property= null;
        let photos= [];
        let videos=[];
        let openHouses = []

        // find property, photos and videos corresponding to the property ID passed.
        if (isReady){
          property= Properties.findOne({prop_id: id});
          photos= Photos.find({prop_id: id}, {sort:{photo_order:1}}).fetch();
          videos= Videos.find({prop_id: id}).fetch();
          openHouses = AgentAvailabilities.find({type: "Open House"}).fetch()
          openHouses = openHouses.filter((p) => p.property.address === property.prop_address)
        }
        
        return {isReady, property, photos, videos, openHouses};

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
          AvailableDate: property.prop_available_date,
          Pets: property.prop_pets ? "True":"False",
          imageUrls: photos.length? photos.map((photo)=>photo.photo_url):["/images/default.jpg"],
          videoUrls: videos.length ? videos.map((video) => video.video_url) : [],
          details:{
          beds: property.prop_numbeds ?? "N/A",
          baths: property.prop_numbaths ?? "N/A",
          carSpots: property.prop_numcarspots ?? "N/A",
          furnished: property.prop_furnish? "Yes":"No",
          },
          description: property.prop_desc,
          
        };
        
      const tenantID = Meteor.userId()
      console.log(tenantID)

  return (
    <div className="min-h-screen bg-[#FFF8E9] flex flex-col">
      {/*Header*/}
      <Navbar />

      {/*Main content and butons*/}
      <div className="max-w-7xl mx-auto w-full px-6">
        <PropertyDetailsCard property={propertyData} />
        <div className="w-full flex flex-row gap-4 mb-8 pt-10">

          <button className="w-1/2 bg-[#9747FF] hover:bg-violet-900 text-white font-base text-center py-2 rounded-md shadow-md transition duration-200"
          onClick={() => setOpenModal(true)}
          key={propertyData}>
            Open House Availabilities
          </button>

          <Link
          to={`/InspectionBooking/${id}`} // TBD: replace with actual link to inspection booking page
          className="w-1/2 bg-[#9747FF] hover:bg-violet-900 text-white font-base text-center py-2 rounded-md shadow-md transition duration-200"
          >Book Inspection 
          </Link>

          <Link
          key={id}
          to={`/Apply/${id}?tenantId=${tenantID}`} // TBD: replace with actual link to application page
          className="w-1/2 bg-[#9747FF] hover:bg-violet-900 text-white font-base text-center py-2 rounded-md shadow-md transition duration-200"
          >Apply 
          </Link>

        </div>

      </div>

      
      {/*Description*/}
      <div className="max-w-7xl mx-auto p-6 text-gray-800 text-base leading-relaxed mb-12">

        <p className="font-semibold text-lg text-[#434343]">
          {propertyData.description}
        </p>
      </div>

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
