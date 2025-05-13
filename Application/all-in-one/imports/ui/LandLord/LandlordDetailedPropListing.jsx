import React from "react";
import { FaBath, FaBed, FaCar, FaCouch } from "react-icons/fa";
import { useParams } from "react-router-dom";
import Navbar from "./components/LandlordNavbar";
import Footer from "./components/Footer";
import PropertyDetailsCard from "../globalComponents/PropertyDetailsCard";

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This page will display the details of a property to the landlord (accessed through the LandlordBasicPropListing page) //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default function LandlordDetailedPropListing() {
  const { id } = useParams();
  // mock data- should be connected to database once its set up
  const mockProperties = [
    {
      id: "1",
      price: 800,
      address: "Melton South, 3338",
      type: "Town house",
      AvailableDate: new Date("2025-05-01"),
      Pets: "True",
      imageUrls: [
        "/images/melton_property_kitchen.jpg",
        "/images/melton_property_livingroom.png",
        "/images/melton_property_outside.jpg",
        "/images/melton_property_pantry.jpg"
      ],
      details: {
        baths: 5,
        beds: 8,
        carSpots: 4,
        furnished: "Yes"
      },
      description:
        "Discover this expansive and elegant residence featuring 8 spacious rooms, 5 modern bathrooms, and ample parking for up to 4 vehicles. Designed with both functionality and luxury in mind, the home offers multiple living and entertainment zones, ideal for growing families or those who love to host. Each bathroom is thoughtfully appointed with contemporary fixtures and sleek finishes, while the generous floor plan provides flexibility for home offices, guest suites, or hobby spaces. Set on a sizable block in a desirable location, this property is the perfect blend of space, style, and convenience."
    }
  ];

  const property = mockProperties.find((p) => p.id === id);

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-600">
        Property Not Found!
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#FFF8EB] flex flex-col">
      {/*Header*/}
      <Navbar />

      {/*Main content*/}
      <div className="max-w-7xl mx-auto w-full px-6">
        <PropertyDetailsCard property={property} />
      </div>

      {/*Description and buttons*/}
      <div className="max-w-7xl mx-auto p-6 text-gray-800 text-base leading-relaxed mb-12">
        <div className="p-6 flex space-x-4 mt-4">
          <button className="flex-1 bg-yellow-300 hover:bg-yellow-400 text-black font-bold py-2 rounded-lg">
            Book Inspection
          </button>
          <button className="flex-1 bg-yellow-300 hover:bg-yellow-400 text-black font-bold py-2 rounded-lg">
            Apply
          </button>
        </div>
        <p className="font-semibold text-lg text-[#434343]">
          {property.description}
        </p>
      </div>

      {/*Footer*/}
      <Footer />
    </div>
  );
}
