import React from "react";
import { FaBath,FaBed, FaCar, FaCouch} from "react-icons/fa";

export default function DetailedPropListing() {
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
    <div className="min-h-screen bg-[#FFF8EB] flex flex-col">
      {/*Header*/}
      <div className="flex items-center justify-between px-8 py-4 bg-[#CEF4F1]">
        <div className="flex items-center gap-2">
          <img src="/images/logo.png" alt="Logo" className="h-12" />
          <span className="text-xl font-bold">All In One</span>
        </div>
        <div className="flex gap-4">
          {["Messages", "Applications", "Tickets", "Properties"].map(
            (label) => (
              <button
                key={label}
                className="px-4 py-2 rounded-full font-semibold"
                style={{ backgroundColor: "#fbe698" }}
              >
                {label}
              </button>
            )
          )}
          <button 
          className="px-4 py-2 rounded-full font-semibold"
          style={{ backgroundColor: "#fbe698" }}
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
          <h1 className="text-3xl font-medium text-gray-800">View Properties (Agent view)</h1>
          <p className="text-gray-600 text-base mt-1">All applications in one place!</p>
          <hr className="my-6 border-t-2 border-gray-300 w-full" 
          style={{ borderTop: '1px solid #e0e0e3', width: '1185px' }}/>
        </div>
      </div>
      
      {/* Search + Filters */}
      <div className="mt-4 flex justify-center">
        <div className="bg-[#CEF4F1] p-4 rounded-lg flex gap-4 w-full" style={{ maxWidth: '1185px' }}>
          <input
            type="text"
            placeholder="Search Property..."
            className="flex-1 px-4 py-2 rounded-md"
            style={{ backgroundColor: '#fffcf7' }}
          />

          <select className="dropdown-arrow ml-auto rounded-lg" style={{ width: '200px',backgroundColor: '#FFFCF7', color: '#9da3ae' }}>
            <option>Filter</option>
          </select>
        </div>
      </div>
      
      {/* Add Property  */}
      <div className="mt-4 w-full flex justify-center">
        <div className="w-[1220px] px-4 py-3 flex justify-start rounded-lg">
          <button
            className="px-6 py-2 text-white rounded-lg focus:outline-none"
            style={{
              backgroundColor: '#fbe698',
              color: '#1f2937',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e6c86a')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#fbe698')}
          >
            Add Property Listing
          </button>
        </div>
      </div>


      {/* Property Grid */}
      <div className="mt-8 w-full flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-20 w-full max-w-[1230px] px-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden"
            style={{ backgroundColor: '#CEF4F1' }}>
              <img src={property.image} alt={property.location} className="w-full h-[250px] object-cover" />
              <div className="p-4">
                <div className="mt-2 flex justify-between items-center">
                  <h2 className="text-3xl font-medium text-gray-500">
                    {property.price} <span className="text-3xl font-medium text-gray-500">per week</span>
                  </h2>
                  <p className="text-gray-600 text-right">{property.location}</p>
                </div>
                  <div className="px-4 pb-4 mt-4 flex justify-between text-gray-600 text-sm">
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
      <footer className="bg-[#CEF4F1] text-white h-[500px] py-4 mt-auto"></footer>  {/* Fixed height with padding */}


    </div>
  );
}
