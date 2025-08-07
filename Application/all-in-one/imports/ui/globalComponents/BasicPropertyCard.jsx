import React from "react";
import { FaBath,FaBed, FaCar, FaCouch} from "react-icons/fa";
import { Link } from 'react-router-dom';

/**
 * PropertyCard Component
 * 
 * A reusable component used to display property information as a card in property lists.
 * This component shows key property details including image, price, location, and amenities.
 * 
 * Features:
 * - Property image display with consistent sizing
 * - Price information prominently displayed
 * - Location information
 * - Amenities icons (bathrooms, bedrooms, parking)
 * - Overlay design with semi-transparent background
 * - Responsive design with hover effects
 * 
 * @param {Object} props - Component props
 * @param {Object} props.property - Property object containing property details
 * @param {string} props.property.image - URL of the property image
 * @param {string} props.property.location - Property location/address
 * @param {string|number} props.property.price - Weekly rent price
 * @param {number} props.property.beds - Number of bedrooms
 * @param {number} props.property.baths - Number of bathrooms
 * @param {number} props.property.cars - Number of parking spaces
 * @returns {JSX.Element} The rendered property card component
 */
export default function PropertyCard ({property}){
    return (
        <div className="relative bg-[#FFF8E9] rounded-lg shadow-md overflow-hidden">
          {/* Property background image */}
          <img
            src={property.image}
            alt={property.location}
            className="w-full h-[375px] object-cover"
          />

          {/* Overlay content with property details */}
          <div className="absolute bottom-0 left-0 right-0 bg-white/85 p-4">
            {/* Price and location information */}
            <div className="mt-2 flex justify-between items-center">
              <h2 className="text-3xl font-medium text-gray-500">
                {property.price} <span className="text-3xl font-medium text-gray-500">per week</span>
              </h2>
              <p className="text-gray-600 text-right">{property.location}</p>
            </div>

            {/* Property amenities (bathrooms, bedrooms, parking) */}
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