import React from "react";
import { Link } from "react-router-dom";
import { FaBath, FaBed, FaCar, FaCouch } from "react-icons/fa";
import { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";

/**
 * PropertyDetailsCard Component
 * 
 * A comprehensive component used to display detailed property information
 * in the detailed property view. This component includes image/video carousel,
 * property details, amenities, and a modal for viewing all media.
 * 
 * Features:
 * - Image and video carousel with navigation arrows
 * - Modal view for all property media
 * - Property details including price, address, type, availability
 * - Amenities display with icons (bathrooms, bedrooms, parking, furnished)
 * - Responsive design for different screen sizes
 * - Loading states and error handling
 * 
 * @param {Object} props - Component props
 * @param {Object} props.property - Property object containing all property details
 * @param {string[]} props.property.imageUrls - Array of property image URLs
 * @param {string[]} props.property.videoUrls - Array of property video URLs
 * @param {string} props.property.price - Weekly rent price
 * @param {string} props.property.address - Property address
 * @param {string} props.property.type - Property type
 * @param {string} props.property.AvailableDate - Available date
 * @param {string} props.property.Pets - Pets allowed status
 * @param {Object} props.property.details - Property amenities details
 * @returns {JSX.Element} The rendered property details card component
 */

/**
 * SampleNextArrow Component
 * 
 * Custom next arrow component for the image carousel slider
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onClick - Click handler for next arrow
 * @returns {JSX.Element} The rendered next arrow component
 */
function SampleNextArrow(props) {
  const { onClick } = props;
  return (
    <div
      onClick={onClick}
      className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-80 text-white rounded-full p-2 cursor-pointer z-10"
    >
      <FaChevronRight size={20} />
    </div>
  );
}

/**
 * SamplePrevArrow Component
 * 
 * Custom previous arrow component for the image carousel slider
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onClick - Click handler for previous arrow
 * @returns {JSX.Element} The rendered previous arrow component
 */
function SamplePrevArrow(props) {
  const { onClick } = props;
  return (
    <div
      onClick={onClick}
      className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-80 text-white rounded-full p-2 cursor-pointer z-10"
    >
      <FaChevronLeft size={20} />
    </div>
  );
}

export default function PropertyDetailsCard({ property }) {
  // Default image displayed if there are no images
  const defaultImage = "/images/default.jpg";

  // State management for modal and media type
  const [activeMediaType, setActiveMediaType] = useState("images");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Error handling for missing property
  if (!property) {
    return <div className="text-lg text-red-600">Property Not Found!</div>;
  }

  /**
   * Opens the modal for viewing all property media
   */
  const openModal = () => {
    // If there are videos, default to showing images first
    setActiveMediaType("images");
    setIsModalOpen(true);
  };

  /**
   * Closes the modal
   */
  const closeModal = () => setIsModalOpen(false);

  // Combine all media for carousel (images first, then videos)
  const allMedia = [
    ...(property.imageUrls?.map((url) => ({ type: "image", url })) || []),
    ...(property.videoUrls?.map((url) => ({ type: "video", url })) || [])
  ];

  return (
    <>
      {/* Image/Video Modal */}
      {isModalOpen && allMedia.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex justify-center items-center p-4">
          <div className="bg-black p-4 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal close button */}
            <div className="w-full text-right mb-2">
              <button
                onClick={closeModal}
                className="text-gray-600 hover:text-black text-xl"
              >
                x
              </button>
            </div>
            
            {/* Single media display or carousel */}
            {allMedia.length === 1 ? (
              // Single media item
              allMedia[0].type === "image" ? (
                <div className="flex justify-center items-center">
                  <img
                    src={allMedia[0].url}
                    alt="Property"
                    className="max-h-[70vh] max-w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex justify-center items-center">
                  <video controls className="max-h-[70vh] max-w-full">
                    <source src={allMedia[0].url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )
            ) : (
              // Multiple media items - carousel
              <Slider
                dots={true}
                infinite={true}
                speed={500}
                slidesToShow={1}
                slidesToScroll={1}
                arrows={true}
                nextArrow={<SampleNextArrow />}
                prevArrow={<SamplePrevArrow />}
              >
                {allMedia.map((media, index) => (
                  <div key={index} className="flex justify-center items-center">
                    {media.type === "image" ? (
                      <img
                        src={media.url}
                        alt={`Property ${index}`}
                        className="max-h-[70vh] max-w-full object-contain"
                      />
                    ) : (
                      <video controls className="max-h-[70vh] max-w-full">
                        <source src={media.url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                ))}
              </Slider>
            )}
          </div>
        </div>
      )}

      {/* Main property content */}
      <div className="flex flex-col lg:flex-row p-4 gap-10 pt-16">
        {/* Left side - Property images */}
        <div className="w-full lg:w-1/2">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Main property image */}
            <div className="w-full sm:w-2/3 h-96 overflow-hidden rounded-lg relative">
              <img
                src={property.imageUrls[0] || defaultImage}
                alt="Property Image"
                className="w-full h-full object-cover"
              />
              {/* View all media button */}
              {(property.imageUrls?.length > 1 ||
                property.videoUrls?.length > 0) && (
                <button
                  onClick={openModal}
                  className="absolute bottom-4 right-4 bg-white text-gray-800 px-3 py-1.5 rounded-md shadow-md hover:bg-gray-100 text-sm font-medium"
                >
                  View All Media
                </button>
              )}
            </div>

            {/* Thumbnail images */}
            <div className="hidden sm:flex flex-col gap-2 w-1/3 h-96">
              {[...Array(3)].map((_, index) => {
                const imageUrl = property.imageUrls[index + 1] || defaultImage;
                return (
                  <div
                    key={index}
                    className="flex-1 overflow-hidden rounded-lg"
                  >
                    <img
                      key={index}
                      src={imageUrl}
                      alt={"Property image"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right side - Property information */}
        <div className="w-full lg:w-1/2 p-2 space-y-3">
          {/* Property price */}
          <div className="text-2xl md:text-3xl font-semibold text-gray-800">
            ${property.price}{" "}
            <span className="text-lg font-medium">per Week </span>
          </div>
          
          {/* Property address */}
          <div className="text-3xl text-gray-800">{property.address}</div>
          
          {/* Property type */}
          <div className="text-1xl text-gray-600">
            Property Type:{" "}
            <span className="text-gray-700">{property.type}</span>
          </div>
          
          {/* Availability or lease start date */}
          <div className="text-1xl text-gray-600">
            <div className="text-1xl text-gray-600">
              {property.leaseStartDate ? (
                <>
                  Lease Start Date:{" "}
                  <span className="text-gray-700">
                    {new Date(property.leaseStartDate).toLocaleDateString()}
                  </span>
                </>
              ) : (
                <>
                  Available From:{" "}
                  <span className="text-gray-700">
                    {property.AvailableDate
                      ? new Date(property.AvailableDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                </>
              )}
            </div>
          </div>
          
          {/* Pets allowed status */}
          <div className="text-1xl text-gray-600">
            Pets Allowed: <span className="text-gray-700">{property.Pets}</span>
          </div>

          {/* Property amenities with icons */}
          <div className="grid grid-cols-2 gap-4 pt-4 text-gray-700">
            <div className="flex items-center gap-2">
              <FaBath className="text-gray-600 text-lg" />
              <span className="text-xl">{property.details.baths}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaBed className="text-gray-600 text-lg" />
              <span className="text-xl">{property.details.beds}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCar className="text-gray-600 text-lg" />
              <span className="text-xl">{property.details.carSpots}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCouch className="text-gray-600 text-lg" />
              <span className="text-xl">{property.details.furnished}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
