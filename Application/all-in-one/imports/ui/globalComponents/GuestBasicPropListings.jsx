/*import React from "react";*/
import { FaBath, FaBed, FaCar, FaCouch , FaSearch, FaFilter, FaTimes, FaMapMarkedAlt } from "react-icons/fa";
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

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    furnished: false,
    pets: false,
    rooms: "",
    cars: "",
    baths: "",
    minPrice: "",
    maxPrice: "",
    propertyType: "",
  });

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
      let firstPhotoUrl = "";
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
        furnished: p.prop_furnished,
        pets: p.prop_petsallowed,
        type: p.prop_type,
      };
    });

    const filteredProperties = propertyCards.filter((p) => {
      // Furnished
      if (filters.furnished && !p.furnished) return false;

      // Pets
      if (filters.pets && !p.pets) return false;

      // Rooms
      if (filters.rooms && p.beds < parseInt(filters.rooms)) return false;

      // Car spots
      if (filters.cars && p.cars < parseInt(filters.cars)) return false;

      // Bathrooms
      if (filters.baths && p.baths < parseInt(filters.baths)) return false;

      // Price
      const price = parseInt(p.price.replace("$", "").replace(",", "") || 0);
      if (filters.minPrice && price < parseInt(filters.minPrice)) return false;
      if (filters.maxPrice && price > parseInt(filters.maxPrice)) return false;

      // Property Type
      if (filters.propertyType && p.type && p.type !== filters.propertyType)
        return false;

      // Search by location/postcode
      if (
        searchQuery &&
        !p.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;

      return true;
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                  onClick={() => setShowFilters(!showFilters)}
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

                  {/* Filter section */}
                  {showFilters && (
                    <div className="mt-4 flex justify-center">
                      <div
                        className="bg-[#CBADD8] py-10 px-10 rounded-lg flex flex-col gap-6 w-full min-h-[400px] relative"
                        style={{ maxWidth: "1100px" }}
                      >
                        {/* Close button */}
                        <button
                          className="absolute top-4 right-4 text-grey-700 hover:text-red-500"
                          onClick={() => setShowFilters(false)}
                        >
                          <FaTimes size={20} />
                        </button>

                        {/* Checkboxes */}
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="w-5 h-5"
                              checked={filters.furnished}
                              onChange={(e) =>
                                setFilters({ ...filters, furnished: e.target.checked })
                              }
                            />
                            Furnished
                          </label>

                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="w-5 h-5"
                              checked={filters.pets}
                              onChange={(e) =>
                                setFilters({ ...filters, pets: e.target.checked })
                              }
                            />
                            Pets Allowed
                          </label>
                        </div>

                        {/* Rooms / Baths / Car Spots */}
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block mb-1 font-semibold">Rooms</label>
                            <input
                              type="number"
                              min="0"
                              className="w-full p-2 rounded border"
                              value={filters.rooms}
                              onChange={(e) =>
                                setFilters({ ...filters, rooms: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="block mb-1 font-semibold">Car Spots</label>
                            <input
                              type="number"
                              min="0"
                              className="w-full p-2 rounded border"
                              value={filters.cars}
                              onChange={(e) =>
                                setFilters({ ...filters, cars: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="block mb-1 font-semibold">Bathrooms</label>
                            <input
                              type="number"
                              min="0"
                              className="w-full p-2 rounded border"
                              value={filters.baths}
                              onChange={(e) =>
                                setFilters({ ...filters, baths: e.target.value })
                              }
                            />
                          </div>
                        </div>

                        {/* Price Range */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-1 font-semibold">Min Price</label>
                            <input
                              type="number"
                              min="0"
                              className="w-full p-2 rounded border"
                              value={filters.minPrice}
                              onChange={(e) =>
                                setFilters({ ...filters, minPrice: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="block mb-1 font-semibold">Max Price</label>
                            <input
                              type="number"
                              min="0"
                              className="w-full p-2 rounded border"
                              value={filters.maxPrice}
                              onChange={(e) =>
                                setFilters({ ...filters, maxPrice: e.target.value })
                              }
                            />
                          </div>
                        </div>

                        {/* Property Type */}
                        <div>
                          <label className="block mb-1 font-semibold">Property Type</label>
                          <select
                            className="w-full p-2 rounded border"
                            value={filters.propertyType}
                            onChange={(e) =>
                              setFilters({ ...filters, propertyType: e.target.value })
                            }
                          >
                            <option value="">Select type</option>
                            <option value="house">House</option>
                            <option value="apartment">Apartment</option>
                            <option value="unit">Unit</option>
                            <option value="townhouse">Townhouse</option>
                          </select>
                        </div>

                        {/* Available From */}
                        <div>
                          <label className="block mb-1 font-semibold">Available From</label>
                          <input
                            type="date"
                            className="w-full p-2 rounded border"
                            value={filters.availableFrom}
                            onChange={(e) =>
                              setFilters({ ...filters, availableFrom: e.target.value })
                            }
                          />
                        </div>

                        {/* Clear Filters */}
                        <div className="mt-4">
                          <button
                            className="bg-[#9747FF] text-white px-6 py-2 rounded hover:bg-[#7d3dd1]"
                            onClick={() =>
                              setFilters({
                                furnished: false,
                                pets: false,
                                rooms: "",
                                baths: "",
                                cars: "",
                                minPrice: "",
                                maxPrice: "",
                                propertyType: "",
                                availableFrom: "",
                              })
                            }
                          >
                            Clear Filters
                          </button>
                        </div>
                      </div>
                    </div>
                  )}




      {/* Property Grid */}
      <div className="mt-8 w-full flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-20 w-full max-w-[1230px] px-6">
          {filteredProperties.map((property) => (
            <Link key={property.id} to={`/GuestDetailedPropListing/${property.id}`}>
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
      <div className="h-40" />
      <Footer />
    </div>
  );
}
