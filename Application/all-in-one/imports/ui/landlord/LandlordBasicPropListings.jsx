import React from "react";
import { FaBath, FaBed, FaCar, FaCouch, FaSearch, FaFilter } from "react-icons/fa";
import { Link } from "react-router-dom";
import Navbar from "./components/LandlordNavbar";
import Footer from "./components/Footer";
import BasicPropertyCard from "../globalComponents/BasicPropertyCard";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Properties, Photos } from "../../api/database/collections"; // importing mock for now

/////////////////////////////////////////////////////////////
// This page will display all the properties to a landlord //
/////////////////////////////////////////////////////////////

export default function LandlordBasicPropListings() {
const { isReady, properties, photos }=  useTracker(()=>{
    const subProps= Meteor.subscribe("properties");
    const subPhotos= Meteor.subscribe("photos");

    const isReady= subProps.ready() && subPhotos.ready();
    const properties= isReady ? Properties.find().fetch(): [];
    const photos= isReady ? Photos.find().fetch(): [];

    return { isReady, properties, photos};

  });

  if (!isReady){
    return <div className="text-center text-gray-600 mt-10">Loading Properties...</div>;
  }

  const availableProperties= properties.filter(
    (p)=> p.prop_status==="Available"
  );

  const propertyCards= availableProperties.map((p)=>{
    const photo= photos.find((photo)=> photo.prop_id===p.prop_id);
    return{
      id: p.prop_id,
      location: p.prop_address,
      price:`$${p.prop_pricepweek}`,
      image:`/images/properties/${p.prop_id}/main.jpg`,
      beds: p.prop_numbeds,
      baths: p.prop_numbaths,
      cars:p.prop_numcarspots,
    };
  });

  return (
    <div className="min-h-screen bg-[#FFF8E9] flex flex-col">
      {/*Header*/}
      <Navbar />

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
              </div>
            </div>

      {/* Property Grid */}
      <div className="mt-8 w-full flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-20 w-full max-w-[1230px] px-6">
          {propertyCards.map((property) => (
            <Link
              key={property.id}
              to={`/LandlordDetailedPropListing/${property.id}`}
            >
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
