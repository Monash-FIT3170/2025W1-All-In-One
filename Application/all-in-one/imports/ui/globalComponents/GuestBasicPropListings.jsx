import React from "react";
import { FaBath, FaBed, FaCar, FaCouch , FaSearch, FaFilter} from "react-icons/fa";
import { Link } from "react-router-dom";
import NavBar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import BasicPropertyCard from "./BasicPropertyCard.jsx";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Properties, Photos } from "../../api/database/collections.js"; // importing mock for now

/**
 * GuestBasicPropListings Component
 * 
 * This component displays a list of available properties for guests (non-authenticated users).
 * It fetches property data and photos from the database and renders them as property cards
 * in a responsive grid layout.
 * 
 * Features:
 * - Fetches available properties and photos using Meteor subscriptions
 * - Displays properties in a responsive grid layout
 * - Search functionality for postcodes
 * - Filter functionality (placeholder)
 * - Navigation to detailed property views
 * - Loading states and error handling
 * - Consistent styling with the application theme
 * 
 * Data Sources:
 * - Properties collection: Property information
 * - Photos collection: Property images
 * 
 * @returns {JSX.Element} The rendered guest property listings component
 */
export default function GuestBasicPropListings() {
  /**
   * Fetches properties and photos data using Meteor subscriptions
   * 
   * @type {Object} Object containing isReady status, properties, and photos
   */
  const { isReady, properties, photos } = useTracker(() => {
    // Subscribe to required data collections
    const subProps = Meteor.subscribe("properties");
    const subPhotos = Meteor.subscribe("photos");
    
    // Check if all subscriptions are ready
    const isReady = subProps.ready() && subPhotos.ready();
    const properties = isReady ? Properties.find().fetch() : [];
    const photos = isReady ? Photos.find().fetch() : [];

    return { isReady, properties, photos };
  });
  
  // Show loading state while data is being fetched
  if (!isReady) {
    return <div className="text-center text-gray-600 mt-10">Loading Properties...</div>;
  }

  /**
   * Filter properties to show only available ones
   * 
   * @type {Array} Array of available properties
   */
  const availableProperties = properties.filter(
    (p) => p.prop_status === "Available"
  );
  
  /**
   * Transform property data for the BasicPropertyCard component
   * 
   * @type {Array} Array of formatted property objects
   */
  const propertyCards = availableProperties.map((p) => {
    const photo = photos.find((photo) => photo.prop_id === p.prop_id);
    return {
      id: p.prop_id,
      location: p.prop_address,
      price: `$${p.prop_pricepweek}`,
      image: `/images/properties/${p.prop_id}/main.jpg`,
      beds: p.prop_numbeds,
      baths: p.prop_numbaths,
      cars: p.prop_numcarspots,
    };
  });

  return (
    <div className="min-h-screen bg-[#FFF8E9] flex flex-col">
      {/* Header navigation */}
      <NavBar />

      {/* Page heading and description */}
      <div className="max-w-7xl mx-auto w-full px-6 mt-6">
        <div className="pl-6">
          <h1 className="text-3xl font-medium text-gray-800">Properties</h1>
          <p className="text-gray-600 text-base mt-1">
            All properties in one place!
          </p>
          <hr
            className="my-6 border-t-2 border-gray-300 w-full"
          />
        </div>
      </div>

      {/* Search and filter functionality */}
      <div className="mt-4 flex justify-center">
        <div className="bg-[#CBADD8] p-4 rounded-lg flex gap-4 w-full" style={{ maxWidth: '1185px' }}>
          {/* Search field with icon */}
          <div className="flex items-center bg-white px-3 py-2 rounded-md w-full">
            <FaSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search Postcode..."
              className="flex-1 outline-none bg-transparent"
            />
          </div>
  
          {/* Search button with icon */}
          <button
            className="flex items-center justify-center bg-[#9747FF] hover:bg-[#7d3dd1] text-white px-4 py-2 rounded-md"
          >
            <FaSearch className="mr-2" />
            Search
          </button>
  
          {/* Filter button with icon */}
          <button
            className="flex items-center justify-center bg-[#9747FF] hover:bg-[#7d3dd1] text-white px-4 py-2 rounded-md"
          >
            <FaFilter className="mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Property grid display */}
      <div className="mt-8 w-full flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-20 w-full max-w-[1230px] px-6">
          {propertyCards.map((property) => (
            <Link
              key={property.id}
              to={`/GuestDetailedPropListing/${property.id}`}
            >
              <BasicPropertyCard property={property} />
            </Link>
          ))}
        </div>
      </div>
      
      {/* Blank space before footer */}
      <div className="h-40" />

      {/* Footer */}
      <Footer />
    </div>
  );
}
