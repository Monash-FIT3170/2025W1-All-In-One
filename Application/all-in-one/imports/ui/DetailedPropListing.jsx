import React from "react";
import { FaBath,FaBed, FaCar, FaCouch} from "react-icons/fa";

export default function DetailedPropListing() {
  // mock data- should be connected to database once its set up

  const properties = [
    {
      id: 1,
      location: "Melton South, 3338",
      price: "$800",
      image: "/images/Melton/melton_property_livingroom.png"
    },
    {
      id: 2,
      location: "Sydney, NSW",
      price: "$620,000",
      image: "https://via.placeholder.com/300x200?text=House+2"
    },
    {
      id: 3,
      location: "Gold Coast, QLD",
      price: "$1,200,000",
      image: "https://via.placeholder.com/300x200?text=House+3"
    },
    {
      id: 4,
      location: "Byron Bay, NSW",
      price: "$980,000",
      image: "https://via.placeholder.com/300x200?text=House+4"
    },
    {
      id: 5,
      location: "Brisbane, QLD",
      price: "$480,000",
      image: "https://via.placeholder.com/300x200?text=House+5"
    },
    {
      id: 6,
      location: "Adelaide, SA",
      price: "$740,000",
      image: "https://via.placeholder.com/300x200?text=House+6"
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
          <h1 className="text-3xl font-medium text-gray-800">View Properties</h1>
          <p className="text-gray-600 text-base mt-1">All applications in one place!</p>
          <hr className="my-6 border-t-2 border-gray-300 w-full" 
          style={{ borderTop: '1px solid #e0e0e3', width: '1185px' }}/>
        </div>
      </div>
      
      {/* Search + Filters */}
      <div className="mt-4 flex justify-center">
        <div className="bg-[#D6F2F2] p-4 rounded-lg flex gap-4 w-full" style={{ maxWidth: '1185px' }}>
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
      
      {/* Add Property Listing Button (Aligned and Indented) */}
      <div className="mt-4 w-full flex justify-end">
        <div className="w-full max-w-7xl px-3">
          <button
            className="px-6 py-2 text-white rounded-lg focus:outline-none"
            style={{
              backgroundColor: '#fbe698',
              color: '#1f2937', // optional: dark text if needed
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 w-full max-w-[1230px] px-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden"
            style={{ backgroundColor: '#D6F2F2' }}>
              <img src={property.image} alt={property.location} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h2 className="mt-2 font-medium text-blue-600">{property.price}</h2>
                <p className="text-gray-600">{property.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      

      
      {/*Description and buttons*/}
      <div className="max-w-7xl mx-auto p-6 text-gray-800 text-base leading-relaxed mb-12">
        <div className="p-6 flex space-x-4 mt-4">
        </div>
      </div>

      {/*Footer*/}
      <footer className="bg-[#CEF4F1] text-white py-6 mt-auto"></footer>
    </div>
  );
}
