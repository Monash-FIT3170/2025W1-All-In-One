import { Meteor } from "meteor/meteor";
import React, { useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from "./components/AgentNavbar";
import Footer from "./components/Footer";
import { useTracker } from "meteor/react-meteor-data";
import { Properties, Photos, Videos } from "../../api/database/collections";


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This page will display the form used by the Agent to modify a property listing's details (accessed through AgentDetailedListing) //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


export default function EditPropertyListing() {
  
  const { id } = useParams();

const {isReady, property, photos, videos} = useTracker(() => {
    const subProps= Meteor.subscribe("properties");
    const subPhotos= Meteor.subscribe("photos");
    const subVideos = Meteor.subscribe("videos");
    
    const isReady = subProps.ready() && subPhotos.ready() && subVideos.ready();
    
    let property = null;
    let photos= [];
    let videos = [];

    if(isReady){
      property = Properties.findOne({prop_id: id});
      photos= Photos.find({prop_id: id}, {sort:{photo_order:1}}).fetch();
      videos = Videos.find({ prop_id: id }).fetch();
    }

    return {isReady, property, photos, videos};

  }, [id]);

  if (!isReady){
    return (<div className="min-h-screen flex items-center justify-center text-xl text-gray-600">Loading Property...</div>);
  }
  
  if (!property){
    return (<div className="min-h-screen flex items-center justify-center text-xl text-red-600">Property Not Found!</div>);
  }
  
  const [photo, setPhoto] = useState("");   // URL for photo/s ??
  const [video, setVideo] = useState("");   // Same for video ??
  {/* ^^ Saving Photos and Videos to Database has not been implemented yet (Milestone 3 issue heh) */}

  const propId = property.prop_id;
  const initialDateAvailable = property.prop_available_date
    ? new Date(property.prop_available_date).toISOString().split("T")[0]
    : "";

  const [propAddress, setPropAddress] = useState(property.prop_address || "");
  const [pricePerWeek, setPricePerWeek] = useState(
    property.prop_pricepweek !== undefined ? String(property.prop_pricepweek) : ""
  );
  const [numBeds, setNumBeds] = useState(
    property.prop_numbeds !== undefined ? String(property.prop_numbeds) : ""
  );
  const [numBaths, setNumBaths] = useState(
    property.prop_numbaths !== undefined ? String(property.prop_numbaths) : ""
  );
  const [numParkSpots, setNumParkSpots] = useState(
    property.prop_numcarspots !== undefined ? String(property.prop_numcarspots) : ""
  );
  const [propType, setPropType] = useState(property.prop_type || "Townhouse");
  const [description, setDescription] = useState(property.prop_desc || "");
  const [dateAvailable, setDateAvailable] = useState(initialDateAvailable);
  const [isFurnished, setIsFurnished] = useState(Boolean(property.prop_furnish));
  const [petsAllowed, setPetsAllowed] = useState(Boolean(property.prop_pets));
  const [bond, setBond] = useState(
    property.prop_bond !== undefined ? String(property.prop_bond) : ""
  );
  const [landlordEmail, setLandlordEmail] = useState("");
  const [errors, setErrors] = useState({});

  const MAX_COUNT = 20;

  const navigate = useNavigate();

  const clearFieldError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleCountChange = (setter, fieldName) => (event) => {
    const { value } = event.target;

    if (value === "") {
      setter("");
      clearFieldError(fieldName);
      return;
    }

    const numericValue = Number(value);

    if (
      Number.isNaN(numericValue) ||
      !Number.isInteger(numericValue) ||
      numericValue < 0 ||
      numericValue > MAX_COUNT
    ) {
      setter(value);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: `Please enter a whole number between 0 and ${MAX_COUNT}.`,
      }));
      return;
    }

    setter(value);
    clearFieldError(fieldName);
  };

  const validateForm = () => {
    const validationErrors = {};

    const counts = [
      { value: numBeds, field: "numBeds", label: "bedrooms" },
      { value: numBaths, field: "numBaths", label: "bathrooms" },
      { value: numParkSpots, field: "numParkSpots", label: "parking spots" },
    ];

    counts.forEach(({ value, field, label }) => {
      const numericValue = Number(value);
      if (
        value === "" ||
        Number.isNaN(numericValue) ||
        !Number.isInteger(numericValue) ||
        numericValue < 0 ||
        numericValue > MAX_COUNT
      ) {
        validationErrors[field] = `Number of ${label} must be a whole number between 0 and ${MAX_COUNT}.`;
      }
    });

    return validationErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    const agentId = Meteor.userId();
    const pricePerWeekValue = Number(pricePerWeek);
    const numBedsValue = Number(numBeds);
    const numBathsValue = Number(numBaths);
    const numParkSpotsValue = Number(numParkSpots);
    const bondValue = Number(bond);
    
    Meteor.call(
      "editPropertyListing",    // See 'imports/api/methods/account.js' for method
      {
        propId,
        propAddress,
        pricePerWeek: pricePerWeekValue,
        numBeds: numBedsValue,
        numBaths: numBathsValue,
        numParkSpots: numParkSpotsValue,
        propType,
        description,
        dateAvailable,
        isFurnished,
        petsAllowed,
        bond: bondValue,
        landlordEmail,
        status: "Available",  // I assume if you are putting a new property, it would be available right??
        agentId,
      },
      (err) => {
        if (err) {
          alert("Editing Property Details failed: " + err.reason);
        }
        else {
          alert("Property Details Successfully Updated!");
          navigate(`/AgentDetaildListing/${id}`)  // Can change this based on where we should go after the form has been submitted
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

          <div className="text-3xl font-medium text-gray-800"> Edit Property Listing </div>
          <div className="text-gray-600 text-base mt-1 mb-5"> 
            Edit the rental property listing at! 
            <span className="text-gray-600 text-base mt-1 mb-5">
              ${id}{" "}
            </span>
          </div>

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
            <div className="text-xl font-semibold text-gray-800"> Edit Property Information </div>
            <div className="text-l text-gray-600 mb-3"> Edit current information about the property</div>

            {/*Address Input*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Address </label>
            <input 
              type="text" 
              required
              placeholder="Enter property address" 
              value={propAddress}
              onChange={(e) => setPropAddress(e.target.value)} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:placeholder-gray-400 mb-5"
            />

            {/*Price per Week Input*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Price per Week </label>
            <input 
              type="number" 
              required
              placeholder="$/week"
              min={0}
              step="0.01"
              value={pricePerWeek}
              onChange={(e) => setPricePerWeek(e.target.value)} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-xs p-2.5 dark:placeholder-gray-400 mb-5"
            />

            {/*Bedrooms Input*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Number of Bedrooms </label>
            <input 
              type="number" 
              required
              placeholder="No. of Bedrooms"
              min={0}
              max={MAX_COUNT}
              step={1}
              value={numBeds}
              onChange={handleCountChange(setNumBeds, "numBeds")} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-xs p-2.5 dark:placeholder-gray-400 mb-5"
            />
            {errors.numBeds && (
              <p className="text-sm text-red-600 -mt-4 mb-5">{errors.numBeds}</p>
            )}

            {/*Bathrooms Input*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Number of Bathrooms </label>
            <input 
              type="number" 
              required
              placeholder="No. of Bathrooms"
              min={0}
              max={MAX_COUNT}
              step={1}
              value={numBaths}
              onChange={handleCountChange(setNumBaths, "numBaths")} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-xs p-2.5 dark:placeholder-gray-400 mb-5"
            />
            {errors.numBaths && (
              <p className="text-sm text-red-600 -mt-4 mb-5">{errors.numBaths}</p>
            )}

            {/*Parking Spot Input*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Number of Parking Spots </label>
            <input 
              type="number" 
              required
              placeholder="No. of Parking Spots"
              min={0}
              max={MAX_COUNT}
              step={1}
              value={numParkSpots}
              onChange={handleCountChange(setNumParkSpots, "numParkSpots")} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-xs p-2.5 dark:placeholder-gray-400 mb-5"
            />
            {errors.numParkSpots && (
              <p className="text-sm text-red-600 -mt-4 mb-5">{errors.numParkSpots}</p>
            )}

            {/*Property Type Dropdown*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Property Type </label>
            <select 
              value={propType}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm text-left rounded-lg block w-full p-5 dark:placeholder-gray-400 mb-5"
            />

            {/*Available Date Input*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Available from date </label>
              <input 
                type="date" 
                required
                placeholder="DD/MM/YYYY"
                value={dateAvailable}
                onChange={(e) => setDateAvailable(e.target.value)} 
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block ps-10 p-2.5 mb-5 w-lg"
              />

            {/*Furnished Dropdown*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Furnished? </label>
            <select 
              value={isFurnished ? "Yes" : "No"}
              onChange={(e) => setIsFurnished(e.target.value == "Yes")} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-lg p-2.5 dark:placeholder-gray-400 mb-5">
                <option>Yes</option>
                <option>No</option>
            </select>

            {/*Pets Allowed Dropdown*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Pets Allowed? </label>
            <select 
              value={petsAllowed ? "Yes" : "No"}
              onChange={(e) => setPetsAllowed(e.target.value == "Yes")} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-lg p-2.5 dark:placeholder-gray-400 mb-5">
                <option>Yes</option>
                <option>No</option>
            </select>

            {/*Bond Input*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Bond </label>
            <input 
              type="number"
              required
              placeholder="$0.00"
              min={0}
              step="0.01"
              value={bond}
              onChange={(e) => setBond(e.target.value)} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-xs p-2.5 dark:placeholder-gray-400 mb-5"
            />

            {/*Landlord ID Input*/}
            <label className="text-l font-semibold text-gray-600 mb-5"> Landlord Email </label>
            <input 
              type="text" 
              placeholder="example@example.com" 
              value={landlordEmail}
              onChange={(e) => setLandlordEmail(e.target.value)} 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-xs p-2.5 dark:placeholder-gray-400 mb-10"
            />

            {/*Submit Button*/}
            <button 
              type="submit" 
              className="flex-1 bg-[#9747FF] hover:bg-violet-900 text-white font-base py-1.5 rounded-lg w-xl p-2.5 text-center mb-5"> 
              Update Property Details 
            </button>


          </form>
        </div>
      </body>


      {/*Footer*/}
      <Footer/>
    </div>
  );
}
