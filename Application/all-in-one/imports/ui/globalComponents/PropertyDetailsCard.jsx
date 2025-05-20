import React from 'react';
import { Link } from 'react-router-dom'; 
import { FaBath,FaBed, FaCar, FaCouch} from "react-icons/fa";
import {useState} from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";

//////////////////////////////////////////////////////////////////////////////////
// Component used to display the Property details in the detailed property view //
//////////////////////////////////////////////////////////////////////////////////
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

export default function PropertyDetailsCard({property}){

  const defaultImage= "/images/default.jpg"

  const [isModalOpen, setIsModalOpen]= useState(false);

    if (!property){
        return (
            <div className="text-lg text-red-600">
                Property Not Found!
            </div>
        );
    }

    const openModal=()=> setIsModalOpen(true);
    const closeModal=()=> setIsModalOpen(false);

    return(
      <>
      {/*Image Carousel*/}
      {isModalOpen && property.imageUrls?.length > 0 &&(
        <div className="fixed inset-0 bg-black/90 z-50 flex justify-center items-center p-4">
          <div className="bg-black p-4 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="w-full text-right mb-2">
            <button
            onClick={closeModal}
            className="text-gray-600 hover:text-black text-xl">
            x
            </button>
            </div>
             {property.imageUrls.length === 1 ? (
        // Show single image without Slider
        <div className="flex justify-center items-center">
          <img
            src={property.imageUrls[0]}
            alt="Property Default"
            className="max-h-[70vh] max-w-full object-contain"
          />
        </div>
      ) :(<Slider dots={true} infinite={true} speed={500} slidesToShow={1} slidesToScroll={1} arrows={true} nextArrow={<SampleNextArrow/>} prevArrow={<SamplePrevArrow/>}>
              {property.imageUrls.map((url, index)=>(
                <div key={index} className="flex justify-center items-center">
                  <img src={url} alt={`Property ${index}`} className="max-h-[70vh] max-w-full object-contain"/>
                </div>
              ))}
            </Slider>
      )}
          </div>
        </div>
      )}
    
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
                {/*View all images button*/}
                <button 
                onClick={openModal}
                className="absolute bottom-4 right-4 bg-white text-gray-800 px-3 py-1.5 rounded-md shadow-md hover:bg-gray-100 text-sm font-medium">
                  View All Images
                </button>
              </div>
              <div className="hidden sm:flex flex-col gap-2 w-1/3 h-96">
                {[...Array(3)].map((_, index)=>{
                  const imageUrl= property.imageUrls[index+1]|| defaultImage;
                  return(
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
                ${property.price} <span className="text-lg font-medium">per Week </span>
            </div>
                <div className="text-3xl text-gray-800">
                    {property.address}
                </div>
                <div className="text-1xl text-gray-600">
                    Property Type: <span className="text-gray-700">{property.type}</span>
                </div>
                <div className="text-1xl text-gray-600">
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
                    
                </div>
                <div className="text-1xl text-gray-600">
                    Pets Allowed: <span className="text-gray-700">{property.Pets}</span>
                </div>

            <div className="grid grid-cols-2 gap-4 pt-4 text-gray-700">
                <div className="flex items-center gap-2">
                    <FaBath className="text-gray-600 text-lg"/>
                    <span className="text-xl">{property.details.baths}</span>
                </div>
                <div className="flex items-center gap-2">
                    <FaBed className="text-gray-600 text-lg"/>
                    <span className="text-xl">{property.details.beds}</span>
                </div>
                <div className="flex items-center gap-2">
                    <FaCar className="text-gray-600 text-lg"/>
                    <span className="text-xl">{property.details.carSpots}</span>
                </div>
                <div className="flex items-center gap-2">
                    <FaCouch className="text-gray-600 text-lg"/>
                    <span className="text-xl">{property.details.furnished}</span>
                </div>
            </div>
          </div>
        </div>
        </>
    );
    }