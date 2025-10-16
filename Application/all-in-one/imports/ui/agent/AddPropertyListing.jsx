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
  const [pricePerWeek, setPricePerWeek] = useState("");
  const [numBeds, setNumBeds] = useState("");
  const [numBaths, setNumBaths] = useState("");
  const [numParkSpots, setNumParkSpots] = useState("");
  const [propType, setPropType] = useState("Townhouse");
  const [description, setDescription] = useState("");
  const [isFurnished, setIsFurnished] = useState(true);
  const [petsAllowed, setPetsAllowed] = useState(true);
  const [bond, setBond] = useState("");
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
    console.log("Files being submitted:", uploadedFiles); // <-- DEBUG LOG
    const agentId= Meteor.userId();
    const pricePerWeekValue = Number(pricePerWeek);
    const numBedsValue = Number(numBeds);
    const numBathsValue = Number(numBaths);
    const numParkSpotsValue = Number(numParkSpots);
    const bondValue = Number(bond);

    Meteor.call(
      "addProperty",    // See 'imports/api/methods/account.js' for method
      {
        propAddress,
        pricePerWeek: pricePerWeekValue,
        numBeds: numBedsValue,
        numBaths: numBathsValue,
        numParkSpots: numParkSpotsValue,
        propType,
        description,
        isFurnished,
        petsAllowed,
        bond: bondValue,
        landlordEmail,
        status: "Available",  // I assume if you are putting a new property, it would be available right??
        agentId,
        photo: uploadedFiles,
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

  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const cloudName = 'dcceytydt'; // replace with your Cloudinary cloud name
  const uploadPreset = 'ml_default'; // replace with your unsigned preset name

const handleUpload = async (event) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  setUploading(true);

  const uploaded = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const isPDF = file.type === 'application/pdf';
    const isVideo = file.type.startsWith('video/');
    const uploadType = isPDF
      ? 'raw'
      : isVideo
      ? 'video'
      : 'image';

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${uploadType}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.secure_url) {
        const fileType = isPDF ? 'pdf' : isVideo ? 'video' : 'image';
        const transformedUrl = isPDF
          ? `https://res.cloudinary.com/${cloudName}/raw/upload/fl_attachment/${data.public_id}`
          : data.secure_url;

        uploaded.push({
          name: file.name,
          url: transformedUrl,
          isPDF,
          isVideo,
        });
      } else {
        console.error('Upload error:', data);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  }

  setUploadedFiles((prev) => [...prev, ...uploaded]);
  setUploading(false);
};


  
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
            <div className="p-6 space-y-4">
              <label
                htmlFor="multi-upload"
                className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded inline-block"
              >
                Upload Files
              </label>
              <input
                id="multi-upload"
                type="file"
                multiple
                className="hidden"
                accept="image/*,.pdf"
                onChange={handleUpload}
              />

              {uploading && <p className="text-yellow-600">Uploading...</p>}

              {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-6 max-w-full">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="text-base w-72">
                      {file.isPDF ? (
                        <a
                          href={file.url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 underline block truncate"
                        >
                          {file.name} (Download PDF)
                        </a>
                      ) : file.isVideo ? (
                        <video
                          controls
                          className="w-full rounded shadow"
                          src={file.url}
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full rounded shadow"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

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
              type="number" 
              required
              placeholder="$/week"
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
