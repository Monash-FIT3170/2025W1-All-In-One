import React from "react";
import { Link } from "react-router-dom";
import { FaBath, FaBed, FaCar, FaCouch } from "react-icons/fa";
import { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";

//////////////////////////////////////////////////////////////////////////////////
// Component used to display the Property details in the detailed property view //
//////////////////////////////////////////////////////////////////////////////////

// Next arrow used for modal
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

// previous arrow used for modal
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
  // image displayed if there are no images
  const defaultImage = "/images/default.jpg";
  console.log(property);
  const [activeMediaType, setActiveMediaType] = useState("images");
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!property) {
    return <div className="text-lg text-red-600">Property Not Found!</div>;
  }
  console.log("test1",property);
  const openModal = () => {
    // If there are videos, default to showing images first
    setActiveMediaType("images");
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  // Transform photo array to media format, filtering out PDFs for display
  // Handle both new photo structure and legacy imageUrls structure
  let photoArray = [];
  
  if (property.photo && property.photo.length > 0) {
    // New structure: array of objects with url, name, isPDF
    photoArray = property.photo;
  } else if (property.imageUrls && property.imageUrls.length > 0) {
    // Legacy structure: array of URL strings
    photoArray = property.imageUrls.map((url, index) => ({
      url: url,
      name: `Property Image ${index + 1}`,
      isPDF: false
    }));
  }
  
  const allMedia = photoArray
    .filter(file => !file.isPDF) // Only show images and videos in carousel
    .map((file) => ({
      type: "image", // Assuming non-PDF files are images, could add video detection logic
      url: file.url,
      name: file.name
    }));

  // Debug logging to check the data structure
  console.log('PhotoArray:', photoArray);
  console.log('All Media:', allMedia);
  console.log('First image URL:', photoArray?.[0]?.url);

  // Get PDF files separately if needed
  const pdfFiles = (property.photo || []).filter(file => file.isPDF);

  return (
    <>
      {/*Image Carousel*/}
      {isModalOpen && allMedia.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex justify-center items-center p-4">
          <div className="bg-black p-4 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="w-full text-right mb-2">
              <button
                onClick={closeModal}
                className="text-gray-600 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
            {allMedia.length === 1 ? (
              <div className="flex justify-center items-center">
                <img
                  src={allMedia[0].url}
                  alt={allMedia[0].name || "Property"}
                  className="max-h-[70vh] max-w-full object-contain"
                />
              </div>
            ) : (
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
                    <img
                      src={media.url}
                      alt={media.name || `Property ${index}`}
                      className="max-h-[70vh] max-w-full object-contain"
                    />
                  </div>
                ))}
              </Slider>
            )}
          </div>
        </div>
      )}

      {/*Actual content*/}
      <div className="flex flex-col lg:flex-row p-4 gap-10 pt-16">
        {/*Images*/}
        <div className="w-full lg:w-1/2">

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="w-full sm:w-2/3 h-96 overflow-hidden rounded-lg relative">
              <img
                src={photoArray?.[0]?.url || defaultImage}
                alt={photoArray?.[0]?.name || "Property Image"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Failed to load image:', photoArray?.[0]?.url);
                  e.target.src = defaultImage;
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', photoArray?.[0]?.url);
                }}
              />
              {/* View all media button */}
              {allMedia.length > 1 && (
                <button
                  onClick={openModal}
                  className="absolute bottom-4 right-4 bg-white text-gray-800 px-3 py-1.5 rounded-md shadow-md hover:bg-gray-100 text-sm font-medium"
                >
                  View All Media ({allMedia.length})
                </button>
              )}
            </div>

            {/*Three images on the thumbnail*/}
            <div className="hidden sm:flex flex-col gap-2 w-1/3 h-96">
              {[...Array(3)].map((_, index) => {
                const photo = photoArray?.[index + 1];
                const imageUrl = photo?.url || defaultImage;
                const altText = photo?.name || "Property image";
                
                return (
                  <div
                    key={index}
                    className="flex-1 overflow-hidden rounded-lg"
                  >
                    <img
                      src={imageUrl}
                      alt={altText}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`Failed to load thumbnail ${index + 1}:`, imageUrl);
                        e.target.src = defaultImage;
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* PDF Files Section (if any) */}
          {photoArray.filter(file => file.isPDF).length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Documents</h3>
              <div className="space-y-2">
                {photoArray.filter(file => file.isPDF).map((pdf, index) => (
                  <a
                    key={index}
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50"
                  >
                    <span>📄</span>
                    <span className="text-blue-600 hover:underline">
                      {pdf.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right hand side - property info */}
        <div className="w-full lg:w-1/2 p-2 space-y-3">
          <div className="text-2xl md:text-3xl font-semibold text-gray-800">
            ${property.prop_pricepweek || property.price}{" "}
            <span className="text-lg font-medium">per Week </span>
          </div>
          <div className="text-3xl text-gray-800">{property.prop_address || property.address}</div>
          <div className="text-1xl text-gray-600">
            Property Type:{" "}
            <span className="text-gray-700">{property.prop_type || property.type}</span>
          </div>
          
          {/*Display lease start date if its given through the input
          currently it'll give a lease start date if there are tenants approved
          if not it will show available date*/}
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
                  {property.prop_available_date?.$date
                    ? new Date(property.prop_available_date.$date).toLocaleDateString()
                    : property.AvailableDate
                    ? new Date(property.AvailableDate).toLocaleDateString()
                    : "N/A"}
                </span>
              </>
            )}
          </div>
          
          <div className="text-1xl text-gray-600">
            Pets Allowed: <span className="text-gray-700">{property.prop_pets ? 'Yes' : 'No'}</span>
          </div>

          {/*Icons and data associated*/}
          <div className="grid grid-cols-2 gap-4 pt-4 text-gray-700">
            <div className="flex items-center gap-2">
              <FaBath className="text-gray-600 text-lg" />
              <span className="text-xl">{property.prop_numbaths || property.details?.baths}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaBed className="text-gray-600 text-lg" />
              <span className="text-xl">{property.prop_numbeds || property.details?.beds}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCar className="text-gray-600 text-lg" />
              <span className="text-xl">{property.prop_numcarspots || property.details?.carSpots}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCouch className="text-gray-600 text-lg" />
              <span className="text-xl">{property.prop_furnish ? 'Furnished' : 'Unfurnished'}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}