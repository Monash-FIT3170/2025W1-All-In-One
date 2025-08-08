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

export default function PropertyDetailsCard({ property, showSaveButton= false }) {
  // image disaplayed if there are no images
  const defaultImage = "/images/default.jpg";

  const [activeMediaType, setActiveMediaType] = useState("images");

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Local saved state, init from property.starred or false
  const [saved, setSaved] = useState(property.starred ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!property) {
    return <div className="text-lg text-red-600">Property Not Found!</div>;
  }

  const openModal = () => {
    // If there are videos, default to showing images first
    setActiveMediaType("images");
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  React.useEffect(() => {
    setSaved(property.starred ?? false);
  }, [property.starred]);

   const toggleSave = () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    if (!saved) {
      // Simulate saving the property
      Meteor.call("starredProperties.add", property.id, (err) => {
        setLoading(false);
        if (err) {
          setError(err.reason || "Error saving listing");
        } else {
          setSaved(true);
        }
      });
    } else {
      Meteor.call("starredProperties.remove", property.id, (err) => {
        setLoading(false);
        if (err) {
          setError(err.reason || "Error removing listing");
        } else {
          setSaved(false);
        }
      }); 
    }
  };

  // Combine all media for carousel (images first, then videos)
  const allMedia = [
    ...(property.imageUrls?.map((url) => ({ type: "image", url })) || []),
    ...(property.videoUrls?.map((url) => ({ type: "video", url })) || [])
  ];

  return (
    <>
      {/*Image Carousel*/}
      {isModalOpen && allMedia.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex justify-center items-center p-4">
          <div className="bg-black p-4 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="w-full text-right mb-2">
              <button
                onClick={closeModal}
                className="text-gray-600 hover:text-black text-xl"
              >
                x
              </button>
            </div>
            {allMedia.length === 1 ? (
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


      {/*Actual content*/}
      <div className="flex flex-col lg:flex-row p-4 gap-10 pt-16">
        {/*Images*/}
        <div className="w-full lg:w-1/2">
          <div className="flex flex-col sm:flex-row gap-2">
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

            {/*Thre three images on the thumbnail*/}
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

        {/* Right hand side- property infor*/}
        <div className="w-full lg:w-1/2 p-2 space-y-3">
          <div className="text-2xl md:text-3xl font-semibold text-gray-800">
            ${property.price}{" "}
            <span className="text-lg font-medium">per Week </span>
          </div>
          <div className="text-3xl text-gray-800">{property.address}</div>
          <div className="text-1xl text-gray-600">
            Property Type:{" "}
            <span className="text-gray-700">{property.type}</span>
          </div>
          <div className="text-1xl text-gray-600">
            {/*Code used to disaply lease start date based on the status of the property: next milestone*/}
            {/*
                  {property.status==='Leased'?(
                    <>
                    Leased On: {' '}
                    <span className="text-gray-700">
                    {property.leaseStartDate
                      ? new Date(property.leaseStartDate).toLocaleDateString()
                      :'N/A'}
                      </span>
                      </>
                  ):(
                    <>
                    Available From:  
                    <span className="text-gray-700">{new Date(property.AvailableDate).toLocaleDateString()}
                    </span>
                    </>
                  )}
                    */}

            {/*Display lease start date if its given through the input
            surrenty itll give a lease start date if there are tenants approved
            if  not it will show vailable date*/}
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
          <div className="text-1xl text-gray-600">
            Pets Allowed: <span className="text-gray-700">{property.Pets}</span>
          </div>

          {/*Icons and data associated*/}
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

          {/* Save Listing button */}
          {showSaveButton && (
            <>
            <button
              onClick={toggleSave}
              disabled={loading}
              className={`mt-6 px-5 py-2 rounded-md shadow-md font-semibold text-white transition-colors duration-200 ${
                property.starred
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 hover:bg-gray-500"
              } ${loading? "opacity-50 cursor-not-allowed":""}`}
            >
              {loading
    ? property.starred
      ? "Removing..."
      : "Saving..."
    : property.starred
    ? "Saved Listing"
    : "Save Listing"}
            </button>
            {error && (
                <div className="text-red-600 mt-2 text-sm font-medium">
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    
    </>
  );
}
