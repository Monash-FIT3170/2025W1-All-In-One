import React from "react";
import { FaBath, FaBed, FaCar, FaCouch } from "react-icons/fa";
import { Link } from "react-router-dom";
import Navbar from "./components/AgentNavbar";
import Footer from "./components/Footer";
import BasicPropertyCard from "../globalComponents/BasicPropertyCard";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This page will display all the listings connected to the Agent (should be linked to property tab in nav bar) //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default function AgentListings() {
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
      <Navbar />

      {/* Page Heading */}
      <div className="max-w-7xl mx-auto w-full px-6 mt-6">
        <div className="pl-6">
          <h1 className="text-3xl font-medium text-gray-800">
            View Properties
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

      <div className="mt-4 w-full flex justify-center">
        <div className="w-[1220px] px-4 py-3 flex justify-start rounded-lg">
          <Link
            to="/AddPropertyListing"
            className="px-6 py-2 text-white rounded-lg focus:outline-none"
            style={{
              backgroundColor: "#fbe698",
              color: "#1f2937"
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#e6c86a")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#fbe698")
            }
          >
            Add Property Listing
          </Link>
        </div>
      </div>

      {/* Property Grid */}
      <div className="mt-8 w-full flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-20 w-full max-w-[1230px] px-6">
          {properties.map((property) => (
            <Link key={property.id} to={`/AgentDetailedListing/${property.id}`}>
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
