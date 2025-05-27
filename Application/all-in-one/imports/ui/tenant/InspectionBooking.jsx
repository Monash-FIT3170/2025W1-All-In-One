import React from 'react';
import { InspectionCalendar } from './components/InspectionCalendar.jsx';
import { BedDouble, ShowerHead, CarFront } from 'lucide-react';
import Navbar from "./components/TenNavbar";
import { Properties, Photos, Videos } from "../../api/database/collections"; 

import { useParams } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { FaBath, FaBed, FaCar, FaCouch } from "react-icons/fa";




export const InspectionBooking = () => {
  const { id } = useParams();
  console.log("propId received:", id);
  
  const { isReady, property, photos, videos } = useTracker(() => {
    const subProps = Meteor.subscribe("properties");
    const subPhotos = Meteor.subscribe("photos");
    const subVideos = Meteor.subscribe("videos");

    const isReady = subProps.ready() && subPhotos.ready() && subVideos.ready();

    let property = null;
    let photos = [];
    let videos = [];

    // find property, photos and videos corresponding to the property ID passed.
    if (isReady) {
      property = Properties.findOne({ prop_id: id });
      photos = Photos.find({ prop_id: id }, { sort: { photo_order: 1 } }).fetch();
      videos = Videos.find({ prop_id: id }).fetch();
    }

    return { isReady, property, photos, videos };
  }, [id]);

  if (!isReady) {
    return (<div className="min-h-screen flex items-center justify-center text-xl text-gray-600">Loading Properties...</div>);
  }

  if (!property) {
    return (<div className="min-h-screen flex items-center justify-center text-xl text-red-600">Property Not Found!</div>);
  }

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

  const tenantID = Meteor.userId();
  console.log(tenantID);

  // Get the main property image
  const mainImage = propertyData.imageUrls[0];

  return (
    <div className="bg-[#FFF8E9] min-h-screen pb-20">
      {/* Header */}
      <Navbar />
      
      {/* Page Title */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Book Property Inspection</h1>
        <p className="text-gray-600">Schedule your inspection for this property</p>
        <hr className="my-6 border-t-2 border-gray-300 w-full" />
      </div>
      
      {/* Featured Property View */}
      <div className="flex justify-center mt-8">
        <div className="flex bg-[#FFF8E9] rounded-2xl overflow-hidden shadow-lg w-full max-w-4xl">
          {/* Left: Image */}
          <div className="w-2/3">
            <img 
              src={mainImage} 
              alt={`Property at ${propertyData.address}`} 
              className="w-full h-full object-cover min-h-[300px]" 
            />
          </div>
          
          {/* Right: Property Info */}
          <div className="flex flex-col justify-center p-8 bg-[#CBADD8] w-1/3">
            <div className="mb-4">
              <p className="text-3xl font-bold text-gray-800">
                ${propertyData.price}
              </p>
              <p className="text-lg text-gray-600">per week</p>
            </div>
            
            <p className="text-lg font-medium text-gray-700 mb-6">
              {propertyData.address}
            </p>
            
            {/* Property Details */}
            <div className="space-y-4 text-gray-700">
              <div className="flex items-center gap-3 text-lg">
                <FaBed className="w-6 h-6 text-gray-600" />
                <span className="font-medium">{propertyData.details.beds} Bedrooms</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <FaBath className="w-6 h-6 text-gray-600" />
                <span className="font-medium">{propertyData.details.baths} Bathrooms</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <FaCar className="w-6 h-6 text-gray-600" />
                <span className="font-medium">{propertyData.details.carSpots} Car Spaces</span>
              </div>
            </div>

            {/* Additional Property Info */}
            <div className="mt-6 pt-4 border-t border-gray-400">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-600">Type:</span>
                  <span className="text-gray-700">{propertyData.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-600">Available:</span>
                  <span className="text-gray-700">
                    {new Date(propertyData.AvailableDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-600">Bond:</span>
                  <span className="text-gray-700">${property.prop_bond}</span>
                </div>
              </div>
              
              {/* Features */}
              <div className="mt-4 space-y-2">
                {propertyData.details.furnished === "Yes" && (
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <FaCouch className="w-4 h-4" />
                    <span>Furnished</span>
                  </div>
                )}
                {propertyData.Pets === "True" && (
                  <div className="text-sm text-green-700">
                    ✓ Pets Allowed
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Property Description */}
      {propertyData.description && (
        <div className="max-w-4xl mx-auto mt-8 px-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">About This Property</h3>
            <p className="text-gray-700 leading-relaxed text-base">
              {propertyData.description}
            </p>
          </div>
        </div>
      )}

      {/* Property Features Summary */}
      <div className="max-w-4xl mx-auto mt-6 px-6">
        <div className="bg-[#EADAFF] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Property Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white rounded-lg p-4">
              <FaBed className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="font-bold text-2xl text-gray-800">{propertyData.details.beds}</p>
              <p className="text-sm text-gray-600">Bedrooms</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <FaBath className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="font-bold text-2xl text-gray-800">{propertyData.details.baths}</p>
              <p className="text-sm text-gray-600">Bathrooms</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <FaCar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="font-bold text-2xl text-gray-800">{propertyData.details.carSpots}</p>
              <p className="text-sm text-gray-600">Car Spaces</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="w-8 h-8 mx-auto mb-2 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">$</span>
              </div>
              <p className="font-bold text-2xl text-gray-800">{propertyData.price}</p>
              <p className="text-sm text-gray-600">Per Week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Section - You can uncomment this when ready */}
      { 
      <div className="mt-12">
        <InspectionCalendar propertyId={propertyData.id} />
      </div>
      }
      
    
    </div>
  );
};
