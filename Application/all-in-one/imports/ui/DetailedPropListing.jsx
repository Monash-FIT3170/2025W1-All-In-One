import React from "react";
import { FaBath,FaBed, FaCar, FaCouch} from "react-icons/fa";
import { useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function DetailedPropListing() {

  const { id } = useParams();
  // mock data- should be connected to database once its set up
  const mockProperties = [{
    id:"1",
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
  },
];

const property= mockProperties.find((p)=> p.id===id);

if (!property){
  return (
    <div className="min-h-screen flex items-center justify-center text-xl text-red-600">
      Property Not Found!
    </div>
  )
}
  return (
    <div className="min-h-screen bg-[#FFF8EB] flex flex-col">
      {/*Header*/}
      <Navbar/>

      {/*Main content*/}
      <div className="max-w-7xl mx-auto w-full px-6">
        <div className="flex flex-col lg:flex-row p-6">
          {/*Images*/}
          <div className="w-full lg:w-2/3">
            <div className="flex space-x-2">
              <div className="w-[100%] h-[30rem] overflow-hidden rounded-lg">
                <img
                  src={property.imageUrls[0]}
                  alt="Property Image"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col space-y-2 w-[50%]">
                {property.imageUrls.slice(1, 4).map((imageUrl, index) => (
                  <div
                    key={index}
                    className="w-full h-[9.6rem] overflow-hidden rounded-lg"
                  >
                    <img
                      key={index}
                      src={imageUrl}
                      alt={"Properry image"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right hand side- property infor*/}
          <div className="flex-1 flex flex-col p-6 space-y-4">
            <div className="text-4xl font-semibold text-gray-800">
                ${property.price} per Week
            </div>
                <div className="text-2xl text-gray-600">
                    {property.address}
                </div>
                <div className="text-1xl text-gray-600">
                    Property Tyep: {property.type}
                </div>
                <div className="text-1xl text-gray-600">
                    Available Date: {property.AvailableDate.toLocaleDateString()}
                </div>
                <div className="text-1xl text-gray-600">
                    Pets Allowed: {property.Pets}
                </div>
            <div className="grid grid-cols-2 gap-y-6 text-gray-700 pt-4">
                <div className="flex items-center space-x-2 text-2xl">
                    <FaBath className="text-gray-700 text-2xl"/>
                    <span>{property.details.baths}</span>
                </div>
                <div className="flex items-center space-x-2 text-2xl">
                    <FaBed className="text-gray-700 "/>
                    <span>{property.details.beds}</span>
                </div>
                <div className="flex items-center space-x-2 text-2xl">
                    <FaCar className="text-gray-700"/>
                    <span>{property.details.carSpots}</span>
                </div>
                <div className="flex items-center space-x-2 text-2xl">
                    <FaCouch className="text-gray-700"/>
                    <span>{property.details.furnished}</span>
                </div>
            </div>
          </div>
        </div>
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
            <button className="flex-1 bg-yellow-300 hover:bg-yellow-400 text-black font-bold py-2 rounded-lg">
                Ticket
            </button>
        </div>
        <p className="font-semibold text-lg text-[#434343]">{property.description}</p>
      </div>

      {/*Footer*/}
      <Footer/>
    </div>
  );
}
