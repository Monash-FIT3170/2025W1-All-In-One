import React from "react";
import { FaBath, FaBed, FaCar, FaCouch } from "react-icons/fa";
import { useParams } from "react-router-dom";
import Navbar from "./components/LandlordNavbar";
import Footer from "./components/Footer";
import PropertyDetailsCard from "../globalComponents/PropertyDetailsCard";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Properties, Photos, Videos, RentalApplications } from "../../api/database/collections"; // importing mock for now

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This page will display the details of a property to the landlord (accessed through the LandlordBasicPropListing page) //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default function LandlordDetailedPropListing() {
  const { id } = useParams();

  const [feedbackText, setFeedbackText] = React.useState('');
  const [rating, setRating] = React.useState('Good');

  const { isReady, property, photos, videos } = useTracker(() => {
    const subProps = Meteor.subscribe("properties");
    const subPhotos = Meteor.subscribe("photos");
    const subVideos = Meteor.subscribe("videos");

    const isReady = subProps.ready() && subPhotos.ready() && subVideos.ready();

    let property = null;
    let photos = [];
    let videos = [];

    // find property, photos and videos corresponding to the property ID passed.
    if (isReady) {
      property = Properties.findOne({ prop_id: id });
      photos = Photos.find({ prop_id: id }, { sort: { photo_order: 1 } }).fetch();
      videos = Videos.find({ prop_id: id }).fetch();
    }

    return { isReady, property, photos, videos };
  }, [id]);

  if (!isReady) {
    return (<div className="min-h-screen flex items-center justify-center text-xl text-gray-600">Loading Properties...</div>);
  }

  if (!property) {
    return (<div className="min-h-screen flex items-center justify-center text-xl text-red-600">Property Not Found!</div>);
  }

  // data passed on to propertyDetailsCard
  const propertyData = {
    id: property.prop_id,
    address: property.prop_address,
    price: property.prop_pricepweek,
    type: property.prop_type,
    AvailableDate: property.prop_available_date,
    Pets: property.prop_pets ? "True" : "False",
    imageUrls: photos.length ? photos.map((photo) => photo.photo_url) : ["/images/default.jpg"],
    videoUrls: videos.length ? videos.map((video) => video.video_url) : [],
    details: {
      beds: property.prop_numbeds ?? "N/A",
      baths: property.prop_numbaths ?? "N/A",
      carSpots: property.prop_numcarspots ?? "N/A",
      furnished: property.prop_furnish ? "Yes" : "No",
    },
    description: property.prop_desc,
  };

  return (
    <div className="min-h-screen bg-[#FFF8E9] flex flex-col">
      {/*Header*/}
      <Navbar />

      {/*Main content*/}
      <div className="max-w-7xl mx-auto w-full px-6">
        <PropertyDetailsCard property={propertyData} />
      </div>

      {/*Description and buttons*/}
      <div className="max-w-7xl mx-auto p-6 text-gray-800 text-base leading-relaxed mb-12">
        <p className="font-semibold text-lg text-[#434343]">
          {propertyData.description}
        </p>
      </div>

      {/* Feedback Form */}
      <div className="max-w-7xl mx-auto p-6 text-gray-800">
        <h3 className="text-lg font-semibold mb-2">Leave Feedback</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log("Feedback text:", feedbackText);
            console.log("Rating:", rating);
          }}
          className="space-y-4"
        >
          <input
            type="text"
            placeholder="Enter your feedback"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          >
           <option value="Shortlisted">🟢 Shortlisted</option>
                <option value="To be Reviewed">🟡 To be Reviewed</option>
                <option value="Flagged">🔴 Flagged</option>
          </select>
          <button
                  className="flex justify-center bg-[#9747FF] hover:bg-[#7d3dd1] text-white px-4 py-2 rounded-md"
                > 
                                 Submit
                </button>
        </form>
      </div>

      {/*Footer*/}
      <Footer />
    </div>
  );
}
