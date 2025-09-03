/*import React from "react";*/
import { FaBath, FaBed, FaCar, FaCouch , FaSearch, FaFilter, FaMapMarkedAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import NavBar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import MapView from "./MapView.jsx";
import BasicPropertyCard from "./BasicPropertyCard.jsx";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Properties, Photos, RentalApplications } from "../../api/database/collections.js"; 
import React, { useState } from "react";

export default function GuestBasicPropListings() {
  /* the map pop up restriction */ 
  const [showMap, setShowMap] = useState(false);

  const { isReady, properties, photos, applications }=  useTracker(()=>{
      const subProps= Meteor.subscribe("properties");
      const subPhotos= Meteor.subscribe("photos");
      const subApps= Meteor.subscribe("rentalApplications");
      
  
      const isReady= subProps.ready() && subPhotos.ready() && subApps.ready();
      
      const properties= isReady ? Properties.find().fetch(): [];
      const photos= isReady ? Photos.find().fetch(): [];
      const applications= isReady ? RentalApplications.find().fetch(): [];
  
      return { isReady, properties, photos, applications };
  
    });
  
    if (!isReady){
      return <div className="text-center text-gray-600 mt-10">Loading Properties...</div>;
    }

    const availableProperties= properties.filter(
    (p)=> {// must be marked available
  if (p.prop_status !== "Available") return false;

  // check if there's any finalized rental app for this property
  const hasFinalizedApp = applications.some(
    (app) => app.prop_id === p.prop_id && app.landLordFinal === "Approved"
  );

  return !hasFinalizedApp;}
  );
  
    const propertyCards= availableProperties.map((p)=>{
      // Prefer Cloudinary URLs stored in Properties.photo (objects or strings)
      let firstPhotoUrl;
      if (Array.isArray(p.photo)) {
        const firstNonVideoPhoto = p.photo.find((item) => {
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
      return{
        id: p.prop_id,
        location: p.prop_address,
        price:`$${p.prop_pricepweek}`,
        image: firstPhotoUrl || "/images/default.jpg",
        beds: p.prop_numbeds,
        baths: p.prop_numbaths,
        cars:p.prop_numcarspots,
      };
    });

  return (
    <div className="min-h-screen bg-[#FFF8E9] flex flex-col">
      {/*Header*/}
      <NavBar />

      {/* Page Heading */}
      <div className="max-w-7xl mx-auto w-full px-6 mt-6">
        <div className="pl-6">
          <h1 className="text-3xl font-medium text-gray-800">Properties</h1>
          <p className="text-gray-600 text-base mt-1">
            All properties in one place!
          </p>
          <hr
            className="my-6 border-t-2 border-gray-300 w-full"
          />
        </div>
      </div>

      {/* Search + Filters */}
            <div className="mt-4 flex justify-center">
              <div className="bg-[#CBADD8] p-4 rounded-lg flex gap-4 w-full" style={{ maxWidth: '1185px' }}>
      
                {/* Search field */}
                <div className="flex items-center bg-white px-3 py-2 rounded-md w-full">
                  <FaSearch className="text-gray-500 mr-2" />
                  <input
                    type="text"
                    placeholder="Search Postcode..."
                    className="flex-1 outline-none bg-transparent"
                  />
                </div>
      
                {/* Search button with icon */}
                <button
                  className="flex items-center justify-center bg-[#9747FF] hover:bg-[#7d3dd1] text-white px-4 py-2 rounded-md"
                >
                  <FaSearch className="mr-2" />
                  Search
                </button>
      
                {/* Filter button with icon */}
                <button
                  className="flex items-center justify-center bg-[#9747FF] hover:bg-[#7d3dd1] text-white px-4 py-2 rounded-md"
                >
                  <FaFilter className="mr-2" />
                  Filter
                </button>

                {/* Map button with icon */}
                <button
                  onClick={() => setShowMap(true)}
                  className="flex items-center justify-center bg-[#9747FF] hover:bg-[#7d3dd1] text-white px-4 py-2 rounded-md"
                  >
                  <FaMapMarkedAlt className="mr-2" />
                  Map
                </button>
              </div>
            </div>

      {/* Property Grid */}
      <div className="mt-8 w-full flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-20 w-full max-w-[1230px] px-6">
          {propertyCards.map((property) => (
            <Link
              key={property.id}
              to={`/GuestDetailedPropListing/${property.id}`}
            >
              <BasicPropertyCard property={property} />
            </Link>
          ))}
        </div>
      </div>
      {/* Blank space before footer */}
      <div className="h-40" />
      {/* Map Popup */}
      {showMap && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white w-3/4 h-3/4 rounded-lg shadow-lg relative flex flex-col">
        {/* Close button */}
          <button
            onClick={() => setShowMap(false)}
            className="absolute top-3 right-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full px-3 py-1 z-10"
          >
            Close
          </button>

          {/* Map content */}
          <div className="flex-1">
            <MapView />
          </div>
        </div>
      </div>
)}

     
          
      
      
      
      
      {/*Footer*/}
      <Footer />
    </div>
  );
}
