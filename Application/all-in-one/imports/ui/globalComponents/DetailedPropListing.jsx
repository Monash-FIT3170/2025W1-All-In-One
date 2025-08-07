import React from "react";
import { FaBath, FaBed, FaCar, FaCouch } from "react-icons/fa";
import { useParams } from "react-router-dom";
import NavBar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import PropertyDetailsCard from "./PropertyDetailsCard";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Properties, Photos, Videos } from "../../api/database/collections"; // importing mock for now
import { Link } from "react-router-dom";

/**
 * DetailedPropListing Component
 * 
 * This component displays detailed information about a specific property.
 * It fetches property data, photos, and videos based on the property ID
 * from the URL parameters and renders a comprehensive property details view.
 * 
 * Features:
 * - Fetches property details, photos, and videos using Meteor subscriptions
 * - Displays comprehensive property information including amenities, description, and media
 * - Provides navigation to book inspections and apply for the property
 * - Handles loading states and error cases
 * - Responsive design with consistent styling
 * 
 * Data Sources:
 * - Properties collection: Basic property information
 * - Photos collection: Property images
 * - Videos collection: Property videos
 * 
 * @returns {JSX.Element} The rendered detailed property listing component
 */
export default function DetailedPropListing() {
  const { id } = useParams();
  
  /**
   * Fetches property data, photos, and videos using Meteor subscriptions
   * 
   * @type {Object} Object containing isReady status, property data, photos, and videos
   */
  const { isReady, property, photos, videos } = useTracker(() => {
    // Subscribe to required data collections
    const subProps = Meteor.subscribe("properties");
    const subPhotos = Meteor.subscribe("photos");
    const subVideos = Meteor.subscribe("videos");
    
    // Check if all subscriptions are ready
    const isReady = subProps.ready() && subPhotos.ready() && subVideos.ready();

    let property = null;
    let photos = [];
    let videos = [];

    // Find property, photos and videos corresponding to the property ID passed
    if (isReady) {
      property = Properties.findOne({prop_id: id});
      photos = Photos.find({prop_id: id}, {sort:{photo_order:1}}).fetch();
      videos = Videos.find({prop_id: id}).fetch();
    }

    return {isReady, property, photos, videos};
  }, [id]);
    
  // Show loading state while data is being fetched
  if (!isReady) {
    return (<div className="min-h-screen flex items-center justify-center text-xl text-gray-600">Loading Properties...</div>);
  }

  // Show error state if property is not found
  if (!property) {
    return (<div className="min-h-screen flex items-center justify-center text-xl text-red-600">Property Not Found!</div>);
  }
    
  /**
   * Prepare property data for the PropertyDetailsCard component
   * 
   * @type {Object} Formatted property data object
   */
  const propertyData = {
    id: property.prop_id,
    address: property.prop_address,
    price: property.prop_pricepweek,
    type: property.prop_type,
    AvailableDate: property.prop_available_date,
    Pets: property.prop_pets ? "True" : "False",
    imageUrls: photos.length ? photos.map((photo) => photo.photo_url) : ["/images/default.jpg"],
    videoUrls: videos.length ? videos.map((video) => video.video_url) : [],
    details: {
      beds: property.prop_numbeds ?? "N/A",
      baths: property.prop_numbaths ?? "N/A",
      carSpots: property.prop_numcarspots ?? "N/A",
      furnished: property.prop_furnish ? "Yes" : "No",
    },
    description: property.prop_desc,
  };

  return (
    <div className="min-h-screen bg-[#FFF8E9] flex flex-col">
      {/* Header navigation */}
      <NavBar />

      {/* Main content and action buttons */}
      <div className="max-w-7xl mx-auto w-full px-6">
        {/* Property details card component */}
        <PropertyDetailsCard property={propertyData} />
        
        {/* Action buttons for booking inspection and applying */}
        <div className="w-full flex flex-row gap-4 mb-8 pt-10">
          <Link
            to={`/login`}
            className="w-1/2 bg-[#9747FF] hover:bg-violet-900 text-white font-base text-center py-2 rounded-md shadow-md transition duration-200"
          >
            Book Inspection 
          </Link>
          <Link
            to={`/login`} 
            className="w-1/2 bg-[#9747FF] hover:bg-violet-900 text-white font-base text-center py-2 rounded-md shadow-md transition duration-200"
          >
            Apply 
          </Link>
        </div>
      </div>

      {/* Property description section */}
      <div className="max-w-7xl mx-auto p-6 text-gray-800 text-base leading-relaxed mb-12">
        <p className="font-semibold text-lg text-[#434343]">
          {propertyData.description}
        </p>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
