import React from "react";
import { FaBath, FaBed, FaCar, FaCouch, FaSearch, FaFilter } from "react-icons/fa";
import { Properties } from "../../api/database/collections";
import { Link } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import Navbar from "./components/AgentNavbar";
import Footer from "./components/Footer";
import PropertyCard from "../globalComponents/BasicPropertyCard";

export default function AgentListings() {
  const { isReady, properties } = useTracker(() => {
    const subProps = Meteor.subscribe("properties");

    const isReady = subProps.ready();
    const agent = Meteor.user();
    const agentId = agent?._id;

    const properties = isReady ? Properties.find({ agent_id: agentId }).fetch() : [];

    return { isReady, properties };
  });

  if (!isReady) {
    return <div className="text-center text-gray-600 mt-10">Loading Properties...</div>;
  }

  const propertyCards = properties.map((p) => {
    return {
      id: p.prop_id,
      location: p.prop_address,
      price: `$${p.prop_pricepweek}`,
      image: p.prop_id ? `/images/properties/${p.prop_id}/main.jpg` : "/images/default.jpg",
      beds: p.prop_numbeds,
      baths: p.prop_numbaths,
      cars: p.prop_numcarspots,
      starred: false // Agents don't need starred functionality for their own listings
    };
  });

  return (
    <div className="min-h-screen bg-[#FFF8E9] flex flex-col">
      {/*Header*/}
      <Navbar />

      {/* Page Heading */}
      <div className="max-w-7xl mx-auto w-full px-6 mt-6">
        <div className="pl-6">
          <h1 className="text-3xl font-medium text-gray-800">View Properties</h1>
          <p className="text-gray-600 text-base mt-1">All your properties in one place!</p>
          <hr className="my-6 border-t-2 border-gray-300 w-full" />
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mt-4 flex justify-center">
        <div className="bg-[#CBADD8] p-4 rounded-lg flex gap-4 w-full" style={{ maxWidth: '1185px' }}>
          <div className="flex items-center bg-white px-3 py-2 rounded-md w-full">
            <FaSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search Postcode..."
              className="flex-1 outline-none bg-transparent"
            />
          </div>

          <button className="flex items-center justify-center bg-[#9747FF] hover:bg-[#7d3dd1] text-white px-4 py-2 rounded-md">
            <FaSearch className="mr-2" />
            Search
          </button>

          <button className="flex items-center justify-center bg-[#9747FF] hover:bg-[#7d3dd1] text-white px-4 py-2 rounded-md">
            <FaFilter className="mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Add Listing Button */}
      <div className="mt-4 w-full flex justify-center">
        <div className="w-[1220px] px-4 py-3 flex justify-start rounded-lg">
          <Link
            to="/AddPropertyListing"
            className="px-6 py-2 text-white rounded-lg focus:outline-none"
            style={{
              backgroundColor: "#9747FF",
              color: "#bg-violet-900",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "bg-violet-900")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#9747FF")
            }
          >
            Add Property Listing
          </Link>
        </div>
      </div>

      {/* Property Grid */}
      <div className="mt-8 w-full flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-20 w-full max-w-[1230px] px-6">
          {propertyCards.map((property) => (

            <PropertyCard
              key={property.id}
              property={property}
              showFav={false}
              onStarToggle={(p) => console.log("Favourited:", p)}
              linkTo={`/AgentDetailedListing/${property.id}`}
            />

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

