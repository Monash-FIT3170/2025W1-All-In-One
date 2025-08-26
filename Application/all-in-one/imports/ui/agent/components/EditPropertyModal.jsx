import React, { useState, useEffect, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import {formatDate} from '../../globalComponents/DateTimeFormatting'
import { Landlord } from '../../../api/database/collections';


function EditPropertyModal({isOpen, onClose, propertyData}) {

  const currLandlordEmail = Landlord.findOne({ll_id: propertyData.landlord}).ll_email;

  const [EOI, setEOI] = useState('');
  const [propAddress, setPropAddress] = useState("");
  const [pricePerWeek, setPricePerWeek] = useState(0);
  const [numBeds, setNumBeds] = useState(0);
  const [numBaths, setNumBaths] = useState(0);
  const [numParkSpots, setNumParkSpots] = useState(0);
  const [propType, setPropType] = useState("Townhouse");
  const [description, setDescription] = useState(propertyData.description);
  const [dateAvailable, setDateAvailable] = useState("");
  const [isFurnished, setIsFurnished] = useState(true);
  const [petsAllowed, setPetsAllowed] = useState(true);
  const [bond, setBond] = useState(0);
  const [landlordEmail, setLandlordEmail] = useState("");

  {/* Submitting an Expression of Interest */}
  const handleSubmit = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-[#CBADD8] rounded-xl px-20 py-5 flex flex-col gap-3 mx-4 shadow-lg w-[90%] max-w-4xl">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-black text-2xl font-bold focus:outline-none place-self-end"
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Title */}
        <div className="text-2xl font-bold text-gray-800"> Edit details of {propertyData.address} </div>
        <div className="text-gray-600 text-base mb-5"> Edit an existing rental property listing! </div>
      
        {/*Description Input*/}
        <label className="text-l font-semibold text-gray-600 mb-5"> Description </label>
        <input 
          type="text"
          required
          placeholder="Enter a brief description of the property" 
          defaultValue={propertyData.description}
          onChange={(e) => setDescription(e.target.value)} 
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm text-left rounded-lg block w-full p-5 dark:placeholder-gray-400 mb-5"
        />


        <div className="flex bg-[#CBADD8]">
          {/* Left column content */}        
          <div className="w-1/2 bg-[#CBADD8] p-4">

            {/*Price per Week Input*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Price per Week ($)</label>
            <input 
              type="decimal" 
              required
              placeholder="$/week"
              defaultValue={propertyData.price}
              min={0}
              onChange={(e) => setPricePerWeek(Number(e.target.value))} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-3/5 p-2.5 dark:placeholder-gray-400 mb-5"
            />

            {/*Bond Input*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Bond ($) </label>
            <input 
              type="decimal"
              required
              placeholder="$0.00"
              defaultValue={propertyData.price}
              min={0}
              onChange={(e) => setBond(Number(e.target.value))} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-3/5 p-2.5 dark:placeholder-gray-400 mb-5"
            />

            {/*Available Date Input*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Available from date </label>
            <input 
              type="date" 
              required
              placeholder="DD/MM/YYYY"
              defaultValue={formatDate(propertyData.AvailableDate)}   //can't get this to show
              onChange={(e) => setDateAvailable(e.target.value)} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block ps-10 p-2.5 mb-5 w-3/5"
            />

            {/*Property Type Dropdown*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Property Type </label>
            <select 
              defaultValue={propertyData.type}
              onChange={(e) => setPropType(e.target.value)}
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-3/5 p-2.5 dark:placeholder-gray-400 mb-5">
                <option>Townhouse</option>
                <option>Apartment</option>
                <option>House</option>
                <option>Condo</option>
            </select>

            {/*Furnished Dropdown*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Furnished? </label>
            <select 
              defaultValue={propertyData.details.furnished}
              onChange={(e) => setIsFurnished(e.target.value == "Yes")} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-3/5 p-2.5 dark:placeholder-gray-400 mb-10">
                <option>Yes</option>
                <option>No</option>
            </select>

          </div>  

          {/* Right column content */}
          <div className="w-1/2 bg-[#CBADD8] p-4">

            {/*Bedrooms Input*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Number of Bedrooms </label>
            <input 
              type="number" 
              required
              placeholder="No. of Bedrooms"
              defaultValue={propertyData.details.beds}
              min={0}
              onChange={(e) => setNumBeds(Number(e.target.value))} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-3/5 p-2.5 dark:placeholder-gray-400 mb-5"
            />

            {/*Bathrooms Input*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Number of Bathrooms </label>
            <input 
              type="number" 
              required
              placeholder="No. of Bathrooms"
              defaultValue={propertyData.details.baths}
              min={0}
              onChange={(e) => setNumBaths(Number(e.target.value))} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-3/5 p-2.5 dark:placeholder-gray-400 mb-5"
            />

            {/*Parking Spot Input*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Number of Parking Spots </label>
            <input 
              type="number" 
              required
              placeholder="No. of Parking Spots"
              defaultValue={propertyData.details.carSpots}
              min={0}
              onChange={(e) => setNumParkSpots(Number(e.target.value))} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-3/5 p-2.5 dark:placeholder-gray-400 mb-5"
            />

            {/*Landlord ID Input*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Landlord Email </label>
            <input 
              type="text" 
              placeholder="example@example.com" 
              defaultValue={currLandlordEmail}
              onChange={(e) => setLandlordEmail(e.target.value)} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-3/5 p-2.5 dark:placeholder-gray-400 mb-5"
            />

            {/*Pets Allowed Dropdown*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Pets Allowed? </label>
            <select 
              defaultValue={propertyData.Pets}
              onChange={(e) => setPetsAllowed(e.target.value == "Yes")} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-3/5 p-2.5 dark:placeholder-gray-400 mb-10">
                <option>Yes</option>
                <option>No</option>
            </select>

          </div>
        </div>


        <div className="flex justify-center mb-1">
          <button
            onClick={handleSubmit}
            className="w-1/1 bg-[#9747FF] hover:bg-violet-900 text-white font-base text-center py-2 px-2 rounded-md shadow-md transition duration-200">
            Save Details
          </button>
        </div>

      </div>
    </div>
  )
}

export default EditPropertyModal;