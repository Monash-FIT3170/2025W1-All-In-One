import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';
import Navbar from "./components/AgentNavbar";
import Footer from "./components/Footer";

//////////////////////////////////////////////////////////////////////////////////////////////////////////
// This page will display the form used by the Agent to add a property (accessed through AgentListings) //
//////////////////////////////////////////////////////////////////////////////////////////////////////////


export default function AddPropertyListing() {

  return (     
    <div className="min-h-screen bg-[#FFF8EB] flex flex-col">
      {/*Header*/}
      <Navbar/>

      <body className="flex-1 flex flex-col p-6 space-y-4">
        <div className="max-w-7xl mx-auto w-full px-6">

          {/* !!! Making TEXT a Link !!! */}
          <Link to='/test' className="text-3xl font-bold text-gray-800"> Add Property Listing </Link>
          <div className="text-xl text-gray-600 mb-5"> Create a new rental property listing! </div>

          {/*Add Property Form*/}
          <form className="max-w-l mx-auto">
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
                <input id="dropzone-file" type="file" class="hidden" />
              </label>
            </div> 

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
                <input id="dropzone-file" type="file" class="hidden" />
              </label>
            </div> 

            {/*Key Information*/}
            <div className="text-xl font-semibold text-gray-800"> Add Key Information </div>
            <div className="text-l text-gray-600 mb-3"> Enter key information about the new property to be displayed on the search page </div>

            <label className="text-l font-semibold text-gray-600 mb-5"> Address </label>
            <input type="text" placeholder="Enter property address" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:placeholder-gray-400 mb-5"/>

            <label className="text-l font-semibold text-gray-600 mb-5"> Price per Week </label>
            <input type="decimal" placeholder="$/week" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-xs p-2.5 dark:placeholder-gray-400 mb-5"/>

            <label className="text-l font-semibold text-gray-600 mb-5"> Number of Bedrooms </label>
            <select class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-xs p-2.5 dark:placeholder-gray-400 mb-5">
              <option>0</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
            </select>

            <label className="text-l font-semibold text-gray-600 mb-5"> Number of Bathrooms </label>
            <select class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-xs p-2.5 dark:placeholder-gray-400 mb-5">
              <option>0</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
            </select>

            <label className="text-l font-semibold text-gray-600 mb-5"> Number of Parking Spots </label>
            <select class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-xs p-2.5 dark:placeholder-gray-400 mb-5">
              <option>0</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
            </select>

            <label className="text-l font-semibold text-gray-600 mb-5"> Property Type </label>
            <select class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-lg p-2.5 dark:placeholder-gray-400 mb-10">
              <option>Townhouse</option>
              <option>Apartment</option>
              <option>House</option>
              <option>Condo</option>
            </select>

            {/*Detailed Information*/}
            <div className="text-xl font-semibold text-gray-800"> Add Detailed Information </div>
            <div className="text-l text-gray-600 mb-3"> Enter key information about the new property to be displayed on the search page </div>

            <label className="text-l font-semibold text-gray-600 mb-5"> Description </label>
            <input type="text" placeholder="Enter a brief description of the property" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm text-left rounded-lg block w-full p-5 dark:placeholder-gray-400 mb-5"/>

            <label className="text-l font-semibold text-gray-600 mb-5"> Available from date </label>
            <div class="relative max-w-sm">
              <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
                  </svg>
              </div>
              <input id="datepicker-autohide" datepicker datepicker-autohide type="text" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 mb-5" placeholder="Select date"/>
            </div>

            <label className="text-l font-semibold text-gray-600 mb-5"> Furnished </label>
            <select class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-lg p-2.5 dark:placeholder-gray-400 mb-5">
              <option>Yes</option>
              <option>No</option>
            </select>

            <label className="text-l font-semibold text-gray-600 mb-5"> Pets Allowed </label>
            <select class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-lg p-2.5 dark:placeholder-gray-400 mb-5">
              <option>Yes</option>
              <option>No</option>
            </select>

            <label className="text-l font-semibold text-gray-600 mb-5"> Bond </label>
            <input type="number" placeholder="$0.00" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-xs p-2.5 dark:placeholder-gray-400 mb-10"/>

            <button className="flex-1 bg-yellow-300 hover:bg-yellow-400 text-black font-bold py-2 rounded-lg w-xl p-2.5 text-center mb-5"> Add Property </button>
          </form>
        </div>
      </body>


      {/*Footer*/}
      <Footer/>
    </div>
  );
}