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
            <div className="text-xl text-red-600">
                Property Not Found!
            </div>
        );
    }

    console.log('Property status:', property.status);
  console.log('Lease start date:', property.leaseStartDate);
  console.log('Available date:', property.AvailableDate);
    const openModal=()=> setIsModalOpen(true);
    const closeModal=()=> setIsModalOpen(false);

    return(
      <>
      {/*Image Carousel*/}
      {isModalOpen && property.imageUrls?.length > 0 &&(
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
          <div className="bg-black p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="w-full text-right mb-2">
            <button
            onClick={closeModal}
            className="absolute top-2 right-4 text-gray-500 hover:text-black text-xl">
            x
            </button>
            </div>
             {property.imageUrls.length === 1 ? (
        // Show single image without Slider
        <div className="flex justify-center items-center">
          <img
            src={property.imageUrls[0]}
            alt="Property Default"
            className="max-h-[60vh] max-w-full object-contain"
          />
        </div>
      ) :(<Slider dots={true} infinite={true} speed={500} slidesToShow={1} slidesToScroll={1} arrows={true} nextArrow={<SampleNextArrow/>} prevArrow={<SamplePrevArrow/>}>
              {property.imageUrls.map((url, index)=>(
                <div key={index} className="flex justify-center items-center">
                  <img src={url} alt={`Property ${index}`} className="max-h-[60vh] max-w-full object-contain"/>
                </div>
              ))}
            </Slider>
      )}
          </div>
        </div>
      )}
    
        <div className="flex flex-col lg:flex-row p-6">
          {/*Images*/}
          <div className="w-full lg:w-2/3">
            <div className="flex space-x-2">
              <div className="w-[100%] h-[30rem] overflow-hidden rounded-lg">
                <img
                  src={property.imageUrls[0] || defaultImage}
                  alt="Property Image"
                  className="w-full h-full object-cover"
                />
                {/*View all images button*/}
                <button 
                onClick={openModal}
                className="absolute bottom-4 right-4 bg-white text-gray-700 px-4 py-2 rounded-lg shadow hover:bg-gray-100">
                  View All Images
                </button>
              </div>
              <div className="flex flex-col space-y-2 w-[50%]">
                {[...Array(3)].map((_, index)=>{
                  const imageUrl= property.imageUrls[index+1]|| defaultImage;
                  return(
                    <div
                    key={index}
                    className="w-full h-[9.6rem] overflow-hidden rounded-lg"
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
          <div className="flex-1 flex flex-col p-6 space-y-4">
            <div className="text-4xl font-semibold text-gray-800">
                ${property.price} per Week
            </div>
                <div className="text-2xl text-gray-600">
                    {property.address}
                </div>
                <div className="text-1xl text-gray-600">
                    Property Type: {property.type}
                </div>
                <div className="text-1xl text-gray-600">
                  {property.status==='Leased'?(
                    <>
                    Leased On: {' '}
                    {property.leaseStartDate
                      ? new Date(property.leaseStartDate).toLocaleDateString()
                      :'N/A'}
                      </>
                  ):(
                    <>
                    Available From: {new Date(property.AvailableDate).toLocaleDateString()}
                    </>
                  )}
                    
                </div>
                <div className="text-1xl text-gray-600">
                    Pets Allowed: {property.Pets}
                </div>
            <div className="grid grid-cols-2 gap-y-6 text-gray-700 pt-4">
                <div className="flex items-center space-x-2 text-2xl">
                    <FaBath className="text-gray-700"/>
                    <span className="text-xl">{property.details.baths}</span>
                </div>
                <div className="flex items-center space-x-2 text-2xl">
                    <FaBed className="text-gray-700 "/>
                    <span className="text-xl">{property.details.beds}</span>
                </div>
                <div className="flex items-center space-x-2 text-2xl">
                    <FaCar className="text-gray-700"/>
                    <span className="text-xl">{property.details.carSpots}</span>
                </div>
                <div className="flex items-center space-x-2 text-2xl">
                    <FaCouch className="text-gray-700"/>
                    <span className="text-xl">{property.details.furnished}</span>
                </div>
            </div>
          </div>
        </div>
        </>
    );
    }