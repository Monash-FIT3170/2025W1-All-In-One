import React from 'react';
import { Link } from 'react-router-dom'; 
import { FaBath,FaBed, FaCar, FaCouch} from "react-icons/fa";

//////////////////////////////////////////////////////////////////////////////////
// Component used to display the Property details in the detailed property view //
//////////////////////////////////////////////////////////////////////////////////

export default function PropertyDetailsCard({property}){
    if (!property){
        return (
            <div classname="text-xl text-red-600">
                Property Not Found!
            </div>
        );
    }
    return(
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
    );
    }