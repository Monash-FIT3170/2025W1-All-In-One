import React from "react";
import { FaBath, FaBed, FaCar, FaCouch } from "react-icons/fa";
import { Link } from "react-router-dom";
import Navbar from "./components/LandlordNavbar";
import Footer from "./components/Footer";
import BasicPropertyCard from "../globalComponents/BasicPropertyCard";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This page will display all the listings connected to the Landlord (should be linked to property tab in nav bar) //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default function LandlordProperties() {
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
    },
    {
      id: 3,
      location: "Gold Coast, 4207",
      price: "$1200",
      image: "/images/GoldCoast/GoldCoast_front.jpeg",
      beds: 3,
      baths: 2,
      cars: 1,
      living: 1
    },
    {
      id: 4,
      location: "Byron Bay, 2481",
      price: "$980",
      image: "/images/Byron_Bay/Byron_Bay_front.jpeg",
      beds: 3,
      baths: 2,
      cars: 1,
      living: 1
    },
    {
      id: 5,
      location: "Brisbane, 4000",
      price: "$480",
      image: "/images/Brisbane/brisbane_living_area.jpeg",
      beds: 3,
      baths: 2,
      cars: 1,
      living: 1
    },
    {
      id: 6,
      location: "Adelaide, 5000",
      price: "$740",
      image: "/images/Adelaide/Adelaide_ dining.jpeg",
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

      {/* Property Grid */}
      <div className="mt-8 w-full flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-20 w-full max-w-[1230px] px-6">
          {properties.map((property) => (
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
