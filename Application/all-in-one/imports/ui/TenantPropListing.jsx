import React from "react";
import { FaBath,FaBed, FaCar, FaCouch, FaFilter, FaSearch} from "react-icons/fa";

export default function BasicPropListing() {
  // mock data- should be connected to database once its set up

  const properties = [
    {
      id: 1,
      location: "Melton South, 3338",
      price: "$800",
      image: "/images/Melton/melton_property_livingroom.png",
      beds: 3,
      baths: 2,
      cars: 1,
      living: 1
    },
    {
      id: 2,
      location: "Sydney, 2000",
      price: "$620",
      image: "/images/Sydney/Sydney_front.jpeg",
      beds: 3,
      baths: 2,
      cars: 1,
      living: 1
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col">
      {/*Header*/}
      <div className="flex items-center justify-between px-8 py-4 bg-[#CBADD8]">
        <div className="flex items-center gap-2">
          <img src="/images/logo.png" alt="Logo" className="h-12" />
        </div>
        <div className="flex gap-4">
          {["Inspections", "Applications", "Properties"].map(
            (label) => (
              <button
                key={label}
                className="px-4 py-2 rounded-full font-semibold  text-white"
                style={{ backgroundColor: "#9747FF" }}
              >
                {label}
              </button>
            )
          )}
          <button 
          className="px-4 py-2 rounded-full font-semibold  text-white"
          style={{ backgroundColor: "#9747FF" }}
          >
            Log out
          </button>
          <img
            src="/images/user-avatar.png"
            alt="User"
            className="w-10 h-10 rounded-full"
          />
        </div>
      </div>

      {/* Page Heading */}
      <div className="max-w-7xl mx-auto w-full px-6 mt-6">
        <div className="pl-6">
          <h1 className="text-3xl font-medium text-gray-800">View Leased Properties (Tenant view)</h1>
          <p className="text-gray-600 text-base mt-1">All applications in one place!</p>
          <hr className="my-6 border-t-2 border-gray-300 w-full" 
          style={{ borderTop: '1px solid #e0e0e3', width: '1185px' }}/>
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
          {properties.map((property) => (
            <div key={property.id} className="relative h-[320px] rounded-lg overflow-hidden shadow-md">
              {/* Availability badge */}
              <div className="absolute top-2 right-2 bg-[#EADAFF] text-black text-lg font-semibold px-3 py-1 rounded-md z-20">
                {property.avalibility}
              </div>
              
              {/* Background image */}
              <img
                src={property.image}
                alt={property.location}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Semi-transparent overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-white/70 p-4 z-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-gray-700">
                    {property.price} <span className="text-3xl font-bold">per week</span>
                  </h2>
                  <p className="text-gray-700">{property.location}</p>
                </div>
                <div className="flex justify-between mt-4 text-gray-700 text-sm">
                  <div className="flex items-center gap-2">
                    <FaBath size={24} />
                    <span className="text-xl">{property.beds}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaBed size={24} />
                    <span className="text-xl">{property.beds}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCar size={24} />
                    <span className="text-xl">{property.beds}</span>
                    </div>
                  </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blank space before footer */}
      <div className="h-40" />


      {/*Footer*/}
      <footer className="bg-[#CBADD8] text-white h-[500px] py-4 mt-auto"></footer>  {/* Fixed height with padding */}


    </div>
  );
}
