import React from "react";
import { FaBath, FaBed, FaCar, FaCouch, FaSearch, FaFilter } from "react-icons/fa";
import { Link } from "react-router-dom";
import Navbar from "./components/TenNavbar";
import Footer from "./components/Footer";
import BasicPropertyCard from "../globalComponents/BasicPropertyCard";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Properties, Photos, RentalApplications } from "../../api/database/collections"; // importing mock for now

////////////////////////////////////////////////////////////////////////////////////////////
// This page will display the list of properties that are leased by the particular tenant //
////////////////////////////////////////////////////////////////////////////////////////////

export default function BasicLeases() {
  const userId= Meteor.userId();

  const leasedProperties= useTracker(()=>{
    if (!userId) return [];

  const applicationsHandle = Meteor.subscribe('rentalApplications');
  const propertiesHandle = Meteor.subscribe('properties');
  const photosHandle = Meteor.subscribe('photos');

  const isLoading = !applicationsHandle.ready() || !propertiesHandle.ready() || !photosHandle.ready();
  if (isLoading) return [];

    const finalisedApplications= RentalApplications.find({
      ten_id: userId,
      status: "Approved",
    }).fetch();

    // exract unique property IDs
    const approvedPropIds= finalisedApplications.map((app)=>app.prop_id);

    const properties= Properties.find({prop_id:{$in: approvedPropIds}}).fetch();

    const allPhotos= Photos.find({prop_id:{$in: approvedPropIds}}).fetch();

    return properties.map((property)=>{
      const photo= allPhotos.find((p)=> p.prop_id===property.prop_id && p.photo_order ===1);
      return {
        id: property.prop_id,
        location: property.prop_address,
        price: `$${property.prop_pricepweek}`,
        image: photo?photo.photo_url: "/default.jpg",
        beds: property.prop_numbeds,
        baths: property.prop_numbaths,
        cars: property.prop_numcarspots
      };
    });
  },[]);
  

  return (
    <div className="min-h-screen bg-[#FFF8E9] flex flex-col">
      {/*Header*/}
      <Navbar />

      {/* Page Heading */}
      <div className="max-w-7xl mx-auto w-full px-6 mt-6">
        <div className="pl-6">
          <h1 className="text-3xl font-medium text-gray-800">
            Leased Properties
          </h1>
          <p className="text-gray-600 text-base mt-1">
            All leased properties in one place!
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
          {leasedProperties.length ===0?(
            <p className="text-gray-700 text-center col-span-2">No Approved leases found</p>
          ):(leasedProperties.map((property) => (
            <Link key={property.id} to={`/DetailedLease/${property.id}`}>
              <BasicPropertyCard property={property} />
            </Link>
          )))}
        </div>
      </div>
      {/* Blank space before footer */}
      <div className="h-40" />

      {/*Footer*/}
      <Footer />
    </div>
  );
}
