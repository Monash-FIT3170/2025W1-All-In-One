import React, { useState } from "react";
import Slider from "react-slick";
import { FaBath, FaBed, FaCar, FaCouch, FaChevronRight, FaChevronLeft } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
  const defaultImage = "/images/default.jpg";
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!property) {
    return <div className="text-lg text-red-600">Property Not Found!</div>;
  }

  // Prepare photoArray from new or legacy structure
  let photoArray = [];

  if (property.photo && property.photo.length > 0) {
    photoArray = property.photo;
  } else if (property.imageUrls && property.imageUrls.length > 0) {
    photoArray = property.imageUrls.map((url, index) => ({
      url,
      name: `Property Image ${index + 1}`,
      isPDF: false,
      isVideo: /\.(mp4|webm|ogg)$/i.test(url),
    }));
  }

  // Detect media type with isVideo or URL extension
  const allMedia = photoArray
    .filter((file) => !file.isPDF)
    .map((file) => ({
      type: file.isVideo || /\.(mp4|webm|ogg)$/i.test(file.url) ? "video" : "image",
      url: file.url,
      name: file.name,
    }));

  console.log("Media detected:", allMedia);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {/* Modal carousel */}
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
                {allMedia[0].type === "video" ? (
                  <video
                    src={allMedia[0].url}
                    controls
                    className="max-h-[70vh] max-w-full object-contain"
                  />
                ) : (
                  <img
                    src={allMedia[0].url}
                    alt={allMedia[0].name || "Property"}
                    className="max-h-[70vh] max-w-full object-contain"
                  />
                )}
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
                {allMedia.map((media, idx) => (
                  <div key={idx} className="flex justify-center items-center">
                    {media.type === "video" ? (
                      <video
                        src={media.url}
                        controls
                        className="max-h-[70vh] max-w-full object-contain"
                      />
                    ) : (
                      <img
                        src={media.url}
                        alt={media.name || `Property ${idx}`}
                        className="max-h-[70vh] max-w-full object-contain"
                      />
                    )}
                  </div>
                ))}
              </Slider>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col lg:flex-row p-4 gap-10 pt-16">
        <div className="w-full lg:w-1/2">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Main media */}
            <div className="w-full sm:w-2/3 h-96 overflow-hidden rounded-lg relative">
              {allMedia.length > 0 && allMedia[0].type === "video" ? (
                <video
                  src={allMedia[0].url}
                  controls
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Video failed to load:", allMedia[0].url);
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <img
                  src={allMedia[0]?.url || defaultImage}
                  alt={allMedia[0]?.name || "Property Image"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Image failed to load:", allMedia[0]?.url);
                    e.target.src = defaultImage;
                  }}
                />
              )}

              {allMedia.length > 1 && (
                <button
                  onClick={openModal}
                  className="absolute bottom-4 right-4 bg-white text-gray-800 px-3 py-1.5 rounded-md shadow-md hover:bg-gray-100 text-sm font-medium"
                >
                  View All Media ({allMedia.length})
                </button>
              )}
            </div>

            {/* Thumbnails */}
            <div className="hidden sm:flex flex-col gap-2 w-1/3 h-96">
              {[...Array(3)].map((_, idx) => {
                const media = allMedia[idx + 1];
                if (!media) {
                  return (
                    <div key={idx} className="flex-1 overflow-hidden rounded-lg">
                      <img
                        src={defaultImage}
                        alt="Default"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  );
                }

                if (media.type === "video") {
                  return (
                    <div key={idx} className="flex-1 overflow-hidden rounded-lg">
                      <video
                        src={media.url}
                        muted
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  );
                }

                return (
                  <div key={idx} className="flex-1 overflow-hidden rounded-lg">
                    <img
                      src={media.url}
                      alt={media.name || "Property image"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`Thumbnail ${idx + 1} failed to load:`, media.url);
                        e.target.src = defaultImage;
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right side info */}
        <div className="w-full lg:w-1/2 p-2 space-y-3">
          <div className="text-2xl md:text-3xl font-semibold text-gray-800">
            ${property.prop_pricepweek || property.price}{" "}
            <span className="text-lg font-medium">per Week </span>
          </div>
          <div className="text-3xl text-gray-800">
            {property.prop_address || property.address}
          </div>
          <div className="text-1xl text-gray-600">
            Property Type:{" "}
            <span className="text-gray-700">{property.prop_type || property.type}</span>
          </div>
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
            Pets Allowed:{" "}
            <span className="text-gray-700">{property.prop_pets ? "Yes" : "No"}</span>
          </div>

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
              <span className="text-xl">{property.prop_furnish ? "Furnished" : "Unfurnished"}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
