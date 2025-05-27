import { Meteor } from "meteor/meteor";
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Navbar from "./components/AgentNavbar";
import Footer from "./components/Footer";


//////////////////////////////////////////////////////////////////////////////////////////////////////////
// This page will display the form used by the Agent to add a property (accessed through AgentListings) //
//////////////////////////////////////////////////////////////////////////////////////////////////////////


export default function AddPropertyListing() {
  
  const [photo, setPhoto] = useState("");   // URL for photo/s ??
  const [video, setVideo] = useState("");   // Same for video ??
  {/* ^^ Saving Photos and Videos to Database has not been implemented yet (Milestone 3 issue heh) */}

  const [propAddress, setPropAddress] = useState("");
  const [pricePerWeek, setPricePerWeek] = useState(0);
  const [numBeds, setNumBeds] = useState(0);
  const [numBaths, setNumBaths] = useState(0);
  const [numParkSpots, setNumParkSpots] = useState(0);
  const [propType, setPropType] = useState("Townhouse");
  const [description, setDescription] = useState("");
  const [dateAvailable, setDateAvailable] = useState("");
  const [isFurnished, setIsFurnished] = useState(true);
  const [petsAllowed, setPetsAllowed] = useState(true);
  const [bond, setBond] = useState(0);
  const [landlordEmail, setLandlordEmail] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const agentId= Meteor.userId();

    Meteor.call(
      "addProperty",    // See 'imports/api/methods/account.js' for method
      {
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
        status: "Available",  // I assume if you are putting a new property, it would be available right??
        agentId,
      },
      (err) => {
        if (err) {
          alert("Adding Property failed: " + err.reason);
        }
        else {
          alert("Property Successfully Added!");
          navigate("/AgentListings")  // Can change this based on where we should go after the form has been submitted
        }
      }
    );
  }


  return (     
    <div className="min-h-screen bg-[#FFF8E9] flex flex-col">
      {/*Header*/}
      <Navbar/>

      <body className="flex-1 flex flex-col p-6 space-y-4">
        <div className="max-w-7xl mx-auto w-full px-6">

          <div className="text-3xl font-medium text-gray-800"> Add Property Listing </div>
          <div className="text-gray-600 text-base mt-1 mb-5"> Create a new rental property listing! </div>

          {/*Add Property Form*/}
          <form className="max-w-l mx-auto" onSubmit={handleSubmit}>

            {/*Photo Dropbox*/}
            <label className="text-xl font-semibold text-gray-600"> Add Photo/s </label>
            <div class="flex items-center justify-center w-full mb-5">
              <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-[#CEF4F1]">
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Upload up to 20 photos (JPG, JPEG, PNG)</p>
                </div>
                <input id="dropzone-file" type="file" class="hidden"/>
              </label>
            </div> 

            {/*Video Dropbox*/}
            <label className="text-xl font-semibold text-gray-600"> Add Video/s </label>
            <div class="flex items-center justify-center w-full mb-10">
              <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-[#CEF4F1]">
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Upload a video up to 200MB (MP4)</p>
                </div>
                <input id="dropzone-file" type="file" class="hidden"/>
              </label>
            </div> 


            {/*Key Information*/}
            <div className="text-xl font-semibold text-gray-800"> Add Key Information </div>
            <div className="text-l text-gray-600 mb-3"> Enter key information about the new property to be displayed on the search page </div>

            {/*Address Input*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Address </label>
            <input 
              type="text" 
              required
              placeholder="Enter property address" 
              onChange={(e) => setPropAddress(e.target.value)} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:placeholder-gray-400 mb-5"
            />

            {/*Price per Week Input*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Price per Week </label>
            <input 
              type="decimal" 
              required
              placeholder="$/week"
              min={0}
              onChange={(e) => setPricePerWeek(Number(e.target.value))} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-xs p-2.5 dark:placeholder-gray-400 mb-5"
            />

            {/*Bedrooms Input*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Number of Bedrooms </label>
            <input 
              type="number" 
              required
              placeholder="No. of Bedrooms"
              min={0}
              onChange={(e) => setNumBeds(Number(e.target.value))} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-xs p-2.5 dark:placeholder-gray-400 mb-5"
            />

            {/*Bathrooms Input*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Number of Bathrooms </label>
            <input 
              type="number" 
              required
              placeholder="No. of Bathrooms"
              min={0}
              onChange={(e) => setNumBaths(Number(e.target.value))} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-xs p-2.5 dark:placeholder-gray-400 mb-5"
            />

            {/*Parking Spot Input*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Number of Parking Spots </label>
            <input 
              type="number" 
              required
              placeholder="No. of Parking Spots"
              min={0}
              onChange={(e) => setNumParkSpots(Number(e.target.value))} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-xs p-2.5 dark:placeholder-gray-400 mb-5"
            />

            {/*Property Type Dropdown*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Property Type </label>
            <select 
              onChange={(e) => setPropType(e.target.value)}
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-lg p-2.5 dark:placeholder-gray-400 mb-10">
                <option>Townhouse</option>
                <option>Apartment</option>
                <option>House</option>
                <option>Condo</option>
            </select>


            {/*Detailed Information*/}
            <div className="text-xl font-semibold text-gray-800"> Add Detailed Information </div>
            <div className="text-l text-gray-600 mb-3"> Enter key information about the new property to be displayed on the search page </div>

            {/*Description Input*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Description </label>
            <input 
              type="text"
              required
              placeholder="Enter a brief description of the property" 
              onChange={(e) => setDescription(e.target.value)} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm text-left rounded-lg block w-full p-5 dark:placeholder-gray-400 mb-5"
            />

            {/*Available Date Input*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Available from date </label>
              <input 
                type="date" 
                required
                placeholder="DD/MM/YYYY"
                onChange={(e) => setDateAvailable(e.target.value)} 
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block ps-10 p-2.5 mb-5 w-lg"
              />

            {/*Furnished Dropdown*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Furnished? </label>
            <select 
              onChange={(e) => setIsFurnished(e.target.value == "Yes")} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-lg p-2.5 dark:placeholder-gray-400 mb-5">
                <option>Yes</option>
                <option>No</option>
            </select>

            {/*Pets Allowed Dropdown*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Pets Allowed? </label>
            <select 
              onChange={(e) => setPetsAllowed(e.target.value == "Yes")} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-lg p-2.5 dark:placeholder-gray-400 mb-5">
                <option>Yes</option>
                <option>No</option>
            </select>

            {/*Bond Input*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Bond </label>
            <input 
              type="decimal"
              required
              placeholder="$0.00"
              min={0}
              onChange={(e) => setBond(Number(e.target.value))} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-xs p-2.5 dark:placeholder-gray-400 mb-5"
            />

            {/*Landlord ID Input*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Landlord Email </label>
            <input 
              type="text" 
              placeholder="example@example.com" 
              onChange={(e) => setLandlordEmail(e.target.value)} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-xs p-2.5 dark:placeholder-gray-400 mb-10"
            />

            {/*Submit Button*/}
            <button 
              type="submit" 
              className="flex-1 bg-[#9747FF] hover:bg-violet-900 text-white font-base py-1.5 rounded-lg w-xl p-2.5 text-center mb-5"> 
              Add Property 
            </button>


          </form>
        </div>
      </body>


      {/*Footer*/}
      <Footer/>
    </div>
  );
}