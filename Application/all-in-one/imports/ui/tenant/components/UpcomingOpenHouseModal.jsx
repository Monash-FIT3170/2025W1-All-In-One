import React, { useState, useEffect, useRef } from 'react';
import SimpleSchema from 'simpl-schema';
import { AgentAvailabilities } from '../../../api/AgentAvailabilities';
import { Tenants, Agents, Properties } from '../../../api/database/collections';
import { Meteor } from 'meteor/meteor';


const openHouseBookings = new SimpleSchema({
  property: Object,
  booking: Object,
  tenant: Object
});

const openHouseEOI = new SimpleSchema({
  property: Object,
  tenant: Object,
  EOI: String
})

// Format date for display
const formatDisplayDate = (dateString) => {
  const date = new Date(dateString);
  const options = { month: 'long', day: 'numeric'}
  const options_year = {year: 'numeric'};
  return date.toLocaleDateString('en-US', options) + getOrdinalSuffix(date.getDate()) + ", " + date.toLocaleDateString('en-us', options_year);
};

// Format time for display
const formatTime = (start, end) => {
  const startTime = new Date(start).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  const endTime = new Date(end).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  return `${startTime} - ${endTime}`;
};

function UpcomingOpenHouseModal({isOpen, onClose, propertyData, openHouses}) {

  {/* Used to close modal when outside is clicked */}
  const modalRef = useRef();
  const closeModal = (e) => {
    if(modalRef.current === e.target){
      onClose();
    }
  };


  const [property, setProperty] = useState('')
  const [openHouseBooking, setOpenHouseBooking] = useState('');
  const [tenant, setTenant] = useState('');
  const [EOI, setEOI] = useState('');

  // const handleSubmit = () => {

  // }

  // const handleSelect = () => {

  // }

  return (
    <div ref={modalRef} onClick={closeModal} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-[#CBADD8] rounded-xl px-20 py-10 flex flex-col gap-5 mx-4">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-black text-xl font-bold focus:outline-none place-self-end"
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold flex justify-center"> 
          Open House Availabilities
        </h2>
        <p className="text-gray-600 mb-1 text-sm flex justify-center">
          Choose from the available times:
        </p>

        {/* Open House Times */}
        <div className="w-full flex justify-center">
          {openHouses.map((openHouse) => (
            <div className="bg-white rounded-lg m-4 p-6 w-64 items-center">
              <h5 className="font-semibold text-gray-600 mb-1 justify-center items-center">{openHouse.start}</h5>
              <button 
              // onClick={handleSelect}
              className="w-1/1 bg-[#9747FF] hover:bg-violet-900 text-white font-base text-center py-2 px-2 rounded-md shadow-md transition duration-200">
                Select
              </button>
            </div>
          ))}
        </div>

        {/* Expression of Interest */}
        <h3 className="text-xl font-bold">
          Expression of Interest
        </h3>
        <p className="text-gray-600 text-sm">
          If none of the above dates suit you, please provide an Expression of Interest to privately inspect the property, with your preferred dates and times.
        </p>

        <div className='flex justify-center mb-3'>
          <textarea 
          value = {EOI}
          onChange={(e) => StylePropertyMapReadOnly(e.target.value)}
          placeholder='Enter expression of interest here with date and time'
          className="w-full p-2 h-24 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9747FF]"
          />
        </div>

        <div className="flex justify-center mb-1">
          <button
            // onClick={handleSubmit}
            className="w-1/1 bg-[#9747FF] hover:bg-violet-900 text-white font-base text-center py-2 px-2 rounded-md shadow-md transition duration-200">
            Send Expression of Interest
          </button>
        </div>

      </div>
    </div>
  )
}

export default UpcomingOpenHouseModal;