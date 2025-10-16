import React, { useState, useEffect, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import {formatDate} from '../../globalComponents/DateTimeFormatting'
// import { Landlord } from '../../../api/database/collections';
import { useNavigate } from 'react-router-dom';


function EditPropertyModal({isOpen, onClose, propertyData}) {
  if(!isOpen) return null;

  const subUsers = Meteor.subscribe("userById", propertyData.landlord);
  const currLandlordEmail = (Meteor.users.findOne(propertyData.landlord)).emails[0].address;

  const propId = propertyData.id;
  const status = propertyData.status;
  const [propAddress, setPropAddress] = useState(propertyData.address);
  const [pricePerWeek, setPricePerWeek] = useState(propertyData.price);
  const [numBeds, setNumBeds] = useState(propertyData.details.beds);
  const [numBaths, setNumBaths] = useState(propertyData.details.baths);
  const [numParkSpots, setNumParkSpots] = useState(propertyData.details.carSpots);
  const [propType, setPropType] = useState(propertyData.type);
  const [description, setDescription] = useState(propertyData.description);
  const [dateAvailable, setDateAvailable] = useState(formatDate(propertyData.AvailableDate));
  const [isFurnished, setIsFurnished] = useState(propertyData.details.furnished);
  const [petsAllowed, setPetsAllowed] = useState(propertyData.Pets);
  const [bond, setBond] = useState(propertyData.bond);
  const [landlordEmail, setLandlordEmail] = useState(currLandlordEmail);

  const navigate = useNavigate();

  {/* Saving the changes */}
  const handleSubmit = (e) => {
    e.preventDefault();

    const agentId = Meteor.userId();

    Meteor.call(
      "EditPropertyListing",
      {
        propId,
        propAddress,
        pricePerWeek,
        numBeds,
        numBaths,
        numParkSpots,
        propType,
        description,
        dateAvailable,
        isFurnished,
        petsAllowed,
        bond,
        landlordEmail,
        status,
        agentId
      },
      (err) => {
        if (err) {
          alert("Updating Property Details Failed: " + err.reason);
        }
        else {
          alert("Property Details Updated Successfully!");
          onClose();
          navigate(`/AgentDetailedListing/${propertyData.id}`)
        }
      }
    );
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
        <div className="text-2xl font-bold text-gray-800"> Edit details of {propertyData.address} </div>
        <div className="text-gray-600 text-base mb-5"> Edit an existing rental property listing! </div>
        
        {/*Address Input*/}
        <label className="text-l font-semibold text-gray-600"> Address </label>
        <input 
          type="text" 
          required
          placeholder="Enter property address" 
          defaultValue={propertyData.address}
          value={propAddress}
          onChange={(e) => setPropAddress(e.target.value)} 
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:placeholder-gray-400"
        />
        
        {/*Description Input*/}
        <label className="text-l font-semibold text-gray-600"> Description </label>
        <input 
          type="text"
          required
          placeholder="Enter a brief description of the property" 
          defaultValue={propertyData.description}
          value={description}
          onChange={(e) => setDescription(e.target.value)} 
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm text-left rounded-lg block w-full p-5 dark:placeholder-gray-400"
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
              value={pricePerWeek}
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
              defaultValue={propertyData.bond}
              value={bond}
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
              defaultValue={formatDate(propertyData.AvailableDate)}
              value={dateAvailable}
              onChange={(e) => setDateAvailable(e.target.value)} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block ps-10 p-2.5 mb-5 w-3/5"
            />

            {/*Property Type Dropdown*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Property Type </label>
            <select 
              defaultValue={propertyData.type}
              value={propType}
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
              defaultValue={propertyData.details.furnished ? "Yes" : "No"}
              onChange={(e) => setIsFurnished(e.target.value == "Yes")} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-3/5 p-2.5 dark:placeholder-gray-400 mb-10">
                <option value="Yes">Yes</option>
                <option value="No">No</option>
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
              value={numBeds}
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
              value={numBaths}
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
              value={numParkSpots}
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
              value={landlordEmail}
              onChange={(e) => setLandlordEmail(e.target.value)} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-3/5 p-2.5 dark:placeholder-gray-400 mb-5"
            />

            {/*Pets Allowed Dropdown*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Pets Allowed? </label>
            <select 
              defaultValue={propertyData.Pets ? "Yes" : "No"}
              onChange={(e) => setPetsAllowed(e.target.value === "Yes")} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-3/5 p-2.5 dark:placeholder-gray-400 mb-10">
                <option value="Yes">Yes</option>
                <option value="No">No</option>
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