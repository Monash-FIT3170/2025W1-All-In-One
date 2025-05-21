import React from "react";
import { FaBath,FaBed, FaCar, FaCouch} from "react-icons/fa";
import { Link } from 'react-router-dom';

////////////////////////////////////////////////////////////////////////////
// Component used to display the Property as a card in the property lists //
////////////////////////////////////////////////////////////////////////////


export default function PropertyCard ({property}){
    return (
        <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
          {/* Background Image */}
          <img
            src={property.image}
            alt={property.location}
            className="w-full h-[375px] object-cover"
          />

          {/* Overlay Content */}
          <div className="absolute bottom-0 left-0 right-0 bg-white/70 p-4">
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
                <span className="text-xl">{property.baths}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCar size={24} />
                <span className="text-xl">{property.cars}</span>
                                  </div>
                                </div>
                            </div>
        </div>                      
    );
}