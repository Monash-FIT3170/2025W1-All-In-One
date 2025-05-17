import React from "react";
import { FaBath, FaBed, FaCar, FaCouch } from "react-icons/fa";
import { Link } from "react-router-dom";
import Navbar from "./components/TenNavbar";
import Footer from "./components/Footer";
import BasicPropertyCard from "../globalComponents/BasicPropertyCard";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Properties, Photos } from "../../api/database/collections"; // importing mock for now

export default function TenantBasicPropListings() {
  const { isReady, properties, photos }=  useTracker(()=>{
      const subProps= Meteor.subscribe("properties");
      const subPhotos= Meteor.subscribe("photos");
  
      const isReady= subProps.ready() && subPhotos.ready();
      const properties= isReady ? Properties.find().fetch(): [];
      const photos= isReady ? Photos.find().fetch(): [];
  
      return { isReady, properties, photos};
  
    });
  
    if (!isReady){
      return <div className="text-center text-gray-600 mt-10">Loading Properties...</div>;
    }
  
    const propertyCards= properties.map((p)=>{
      const photo= photos.find((photo)=> photo.prop_id===p.prop_id);
      return{
        id: p.prop_id,
        location: p.prop_address,
        price:`$${p.prop_pricepweek}`,
        image:photo?.photo_url ||
        "/images/default.jpg",
        beds: p.prop_numbeds,
        baths: p.prop_numbaths,
        cars:p.prop_numcarspots,
      };
    });

  return (
    <div className="min-h-screen bg-[#FFF8EB] flex flex-col">
      {/*Header*/}
      <Navbar />

      {/* Page Heading */}
      <div className="max-w-7xl mx-auto w-full px-6 mt-6">
        <div className="pl-6">
          <h1 className="text-3xl font-medium text-gray-800">Properties</h1>
          <p className="text-gray-600 text-base mt-1">
            All properties in one place!
          </p>
          <hr
            className="my-6 border-t-2 border-gray-300 w-full"
            style={{ borderTop: "1px solid #e0e0e3", width: "1185px" }}
          />
        </div>
      </div>

      {/* Property Grid */}
      <div className="mt-8 w-full flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-20 w-full max-w-[1230px] px-6">
          {propertyCards.map((property) => (
            <Link
              key={property.id}
              to={`/TenDetailedPropListing/${property.id}`}
            >
              <BasicPropertyCard property={property} />
            </Link>
          ))}
        </div>
      </div>
      {/* Blank space before footer */}
      <div className="h-40" />

      {/*Footer*/}
      <Footer />
    </div>
  );
}
