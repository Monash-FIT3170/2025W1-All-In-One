import React, { useState, useEffect, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import {formatDate} from '../../globalComponents/DateTimeFormatting'
import { useNavigate } from 'react-router-dom';


function EditMediaModal({isOpen, onClose, propertyData}) {

  const propId = propertyData.id;

  const navigate = useNavigate();

  {/* Saving the changes */}
  const handleSubmit = (e) => {
    e.preventDefault();

    const agentId = Meteor.userId();

    // Meteor.call(
    //   "EditPropertyMedia",
    //   {
    //     propId,
    //     photo
    //   },
    //   (err) => {
    //     if (err) {
    //       alert("Updating Property Media Failed: " + err.reason);
    //     }
    //     else {
    //       alert("Property Media Updated Successfully!");
    //       onClose();
    //       navigate(`/AgentDetailedListing/${propertyData.id}`)
    //     }
    //   }
    // );
    
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-[#CBADD8] rounded-xl px-20 py-5 flex flex-col gap-3 mx-4 shadow-lg w-[90%] max-w-4xl">

        {/* Close Button */}
        <button
          onClick={() => onClose()}
          className="text-gray-600 hover:text-black text-2xl font-bold focus:outline-none place-self-end"
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Title */}
        <div className="text-2xl font-bold text-gray-800"> Edit media for {propertyData.address} </div>
        <div className="text-gray-600 text-base mb-5"> Edit an existing rental property listing! </div>


        <div className="flex bg-[#CBADD8]">
          {/* Left column content */}        
          <div className="w-1/2 bg-[#CBADD8] p-4">


          </div>  

          {/* Right column content */}
          <div className="w-1/2 bg-[#CBADD8] p-4">


          </div>
        </div>


        <div className="flex justify-center mb-1">
          <button
            onClick={handleSubmit}
            className="w-1/1 bg-[#9747FF] hover:bg-violet-900 text-white font-base text-center py-2 px-2 rounded-md shadow-md transition duration-200">
            Save Media Changes
          </button>
        </div>

      </div>
    </div>
  )
}

export default EditMediaModal;