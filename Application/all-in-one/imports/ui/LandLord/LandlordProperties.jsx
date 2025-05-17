import React from "react";
import { FaBath, FaBed, FaCar, FaCouch } from "react-icons/fa";
import { Link } from "react-router-dom";
import Navbar from "./components/LandlordNavbar";
import Footer from "./components/Footer";
import BasicPropertyCard from "../globalComponents/BasicPropertyCard";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Properties, Photos } from "../../api/database/collections"; // importing mock for now


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This page will display all the listings connected to the Landlord (should be linked to property tab in nav bar) //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default function LandlordProperties() {
  
    const LandLordId= "L001" // this should be adjusted so that the logged in landlords's id is taken
    
    const { isReady, properties, photos }=  useTracker(()=>{
      const subProps= Meteor.subscribe("properties");
      const subPhotos= Meteor.subscribe("photos");
  
      const isReady= subProps.ready() && subPhotos.ready();
      const properties= isReady ? Properties.find({landlord_id: LandLordId}).fetch(): [];
      const photos= isReady ? Photos.find().fetch(): [];
  
      return { isReady, properties, photos};
  
    });
  
    if (!isReady){
      return <div className="text-center text-gray-600 mt-10">Loading Properties...</div>;
    }
  
    const propertyCards= properties.map((p)=>{
      const photo= photos.find((photo)=> photo.prop_id===p.prop_id);
      return{
        id: p.prop_id,
        location: p.prop_address,
        price:`$${p.prop_pricepweek}`,
        image:photo?.photo_url ||
        "/images/default.jpg",
        beds: p.prop_numbeds,
        baths: p.prop_numbaths,
        cars:p.prop_numcarspots,
      };
    });

  return (
    <div className="min-h-screen bg-[#FFF8EB] flex flex-col">
      {/*Header*/}
      <Navbar />

      {/* Page Heading */}
      <div className="max-w-7xl mx-auto w-full px-6 mt-6">
        <div className="pl-6">
          <h1 className="text-3xl font-medium text-gray-800">
            Your Properties
          </h1>
          <p className="text-gray-600 text-base mt-1">
            All your properties in one place!
          </p>
          <hr
            className="my-6 border-t-2 border-gray-300 w-full"
            style={{ borderTop: "1px solid #e0e0e3", width: "1185px" }}
          />
        </div>
      </div>

       {/* Search + Filters */}
      <div className="mt-4 flex justify-center">
        <div
          className="bg-[#CEF4F1] p-4 rounded-lg flex gap-4 w-full"
          style={{ maxWidth: "1185px" }}
        >
          <input
            type="text"
            placeholder="Search Property..."
            className="flex-1 px-4 py-2 rounded-md"
            style={{ backgroundColor: "#fffcf7" }}
          />

          <select
            className="dropdown-arrow ml-auto rounded-lg"
            style={{
              width: "200px",
              backgroundColor: "#FFFCF7",
              color: "#9da3ae"
            }}
          >
            <option>Filter</option>
          </select>
        </div>
      </div>

      {/* Property Grid */}
      <div className="mt-8 w-full flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-20 w-full max-w-[1230px] px-6">
          {propertyCards.map((property) => (
            <Link key={property.id} to={`/LandlordDetailedProp/${property.id}`}>
              <BasicPropertyCard property={property} />
            </Link>
          ))}
        </div>
      </div>
      {/* Blank space before footer */}
      <div className="h-40" />

      {/*Footer*/}
      <Footer />
    </div>
  );
}
