import React from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import { Link } from "react-router-dom";
import Navbar from "./components/TenNavbar";
import Footer from "./components/Footer";
import BasicPropertyCard from "../globalComponents/BasicPropertyCard";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Properties, Photos, RentalApplications } from "../../api/database/collections";

export default function BasicLeases() {
  const userId = Meteor.userId();

  const leasedProperties = useTracker(() => {
    if (!userId) return [];

    const appsHandle = Meteor.subscribe("rentalApplications");
    const propsHandle = Meteor.subscribe("properties");
    const photosHandle = Meteor.subscribe("photos");

    const isLoading = !appsHandle.ready() || !propsHandle.ready() || !photosHandle.ready();
    if (isLoading) return [];

    // Get all approved applications for the tenant
    const approvedApps = RentalApplications.find({
      ten_id: userId,
      landLordFinal: "Approved",
    }).fetch();

    if (approvedApps.length === 0) return [];

    const approvedPropIds = approvedApps.map((app) => app.prop_id);

    // Get all properties corresponding to approved apps
    const properties = Properties.find({ prop_id: { $in: approvedPropIds } }).fetch();

    // Get all first photos for those properties
    const allPhotos = Photos.find({
      prop_id: { $in: approvedPropIds },
      photo_order: 1,
    }).fetch();

    return properties.map((property) => {
      // Prefer Cloudinary-style URLs from property.photo if available
      let firstPhotoUrl = null;
      if (Array.isArray(property.photo)) {
        const firstNonVideoPhoto = property.photo.find((item) => {
          if (typeof item === 'string') return item.trim().length > 0;
          if (item && typeof item === 'object') {
            const isNotVideo = item.isVideo === false || item.isVideo === undefined;
            const isNotPdf = item.isPDF === false || item.isPDF === undefined;
            return Boolean(item.url) && isNotVideo && isNotPdf;
          }
          return false;
        });
        if (typeof firstNonVideoPhoto === 'string') {
          firstPhotoUrl = firstNonVideoPhoto;
        } else if (firstNonVideoPhoto && typeof firstNonVideoPhoto === 'object') {
          firstPhotoUrl = firstNonVideoPhoto.url;
        }
      }

      // Fallback to Photos collection (photo_order 1)
      if (!firstPhotoUrl) {
        const photo = allPhotos.find((p) => p.prop_id === property.prop_id);
        firstPhotoUrl = photo ? photo.photo_url : null;
      }

      return {
        id: property.prop_id,
        location: property.prop_address,
        price: `$${property.prop_pricepweek}`,
        image: firstPhotoUrl || "/images/default.jpg",
        beds: property.prop_numbeds,
        baths: property.prop_numbaths,
        cars: property.prop_numcarspots,
      };
    });
  }, [userId]);

  return (
    <div className="min-h-screen bg-[#FFF8E9] flex flex-col">
      <Navbar />

      {/* Page Heading */}
      <div className="max-w-7xl mx-auto w-full px-6 mt-6">
        <div className="pl-6">
          <h1 className="text-3xl font-medium text-gray-800">Leased Properties</h1>
          <p className="text-gray-600 text-base mt-1">All leased properties in one place!</p>
          <hr className="my-6 border-t-2 border-gray-300 w-full" />
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mt-4 flex justify-center">
        <div className="bg-[#CBADD8] p-4 rounded-lg flex gap-4 w-full" style={{ maxWidth: "1185px" }}>
          {/* Search field */}
          <div className="flex items-center bg-white px-3 py-2 rounded-md w-full">
            <FaSearch className="text-gray-500 mr-2" />
            <input type="text" placeholder="Search Postcode..." className="flex-1 outline-none bg-transparent" />
          </div>

          {/* Search button */}
          <button className="flex items-center justify-center bg-[#9747FF] hover:bg-[#7d3dd1] text-white px-4 py-2 rounded-md">
            <FaSearch className="mr-2" />
            Search
          </button>

          {/* Filter button */}
          <button className="flex items-center justify-center bg-[#9747FF] hover:bg-[#7d3dd1] text-white px-4 py-2 rounded-md">
            <FaFilter className="mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Property Grid */}
      <div className="mt-8 w-full flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-20 w-full max-w-[1230px] px-6">
          {leasedProperties.length === 0 ? (
            <p className="text-gray-700 text-center col-span-2">No Approved leases found</p>
          ) : (
            leasedProperties.map((property) => (
              <Link key={property.id} to={`/DetailedLease/${property.id}`}>
                <BasicPropertyCard property={property} />
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="h-40" /> {/* Spacer before footer */}
      <Footer />
    </div>
  );
}
