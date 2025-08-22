import React from "react";
import { FaBath, FaBed, FaCar, FaCouch } from "react-icons/fa";
import { useParams } from "react-router-dom";
import NavBar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import PropertyDetailsCard from "./PropertyDetailsCard";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Properties, Photos, Videos } from "../../api/database/collections"; // importing mock for now
import { Link } from "react-router-dom";

///////////////////////////////////////////////////////////////////////////////////////////////////////
// This page will display the details of a listed property (accessed through TenantBasicPropListing) //
///////////////////////////////////////////////////////////////////////////////////////////////////////

export default function DetailedPropListing() {
  const { id } = useParams();
  
     const { isReady, property, photos, videos }=  useTracker(()=>{
        const subProps= Meteor.subscribe("properties");
        const subPhotos= Meteor.subscribe("photos");
        const subVideos= Meteor.subscribe("videos");
    
        const isReady= subProps.ready() && subPhotos.ready() && subVideos.ready();
  
        let property= null;
        let photos= [];
        let videos=[];
  
        // find property, photos and videos corresponding to the property ID passed.
        if (isReady){
          property= Properties.findOne({prop_id: id});
          photos= Photos.find({prop_id: id}, {sort:{photo_order:1}}).fetch();
          videos= Videos.find({prop_id: id}).fetch();
        }
  
        return {isReady, property, photos, videos};
    
      }, [id]);
    
      if (!isReady){
        return (<div className="min-h-screen flex items-center justify-center text-xl text-gray-600">Loading Properties...</div>);
      }
  
      if (!property){
        return (<div className="min-h-screen flex items-center justify-center text-xl text-red-600">Property Not Found!</div>);
      }
    
      // data passed on to propertyDetailsCard
      const propertyData= {
          id: property.prop_id,
          address: property.prop_address,
          price:property.prop_pricepweek,
          type:property.prop_type,
          AvailableDate: property.prop_available_date,
          Pets: property.prop_pets ? "True":"False",
          
          // FIXED: Use Cloudinary URLs from Properties.photo field instead of Photos collection
          imageUrls: property.photo && property.photo.length > 0 
            ? property.photo.filter(p => !p.isPDF).map(p => p.url)
            : photos.length 
              ? photos.map((photo)=>photo.photo_url)
              : ["/images/default.jpg"],
          
          // Also pass the original photo array for the new structure
          photo: property.photo || [],
          
          videoUrls: videos.length ? videos.map((video) => video.video_url) : [],
          details:{
          beds: property.prop_numbeds ?? "N/A",
          baths: property.prop_numbaths ?? "N/A",
          carSpots: property.prop_numcarspots ?? "N/A",
          furnished: property.prop_furnish? "Yes":"No",
          },
          description: property.prop_desc,
          photo: property.photo,
        };
  return (
    <div className="min-h-screen bg-[#FFF8E9] flex flex-col">
      {/*Header*/}
      <NavBar />

      {/*Main content and butons*/}
      <div className="max-w-7xl mx-auto w-full px-6">
        <PropertyDetailsCard property={property} />
        <div className="w-full flex flex-row gap-4 mb-8 pt-10">
          <Link
          to={`/login`}
          className="w-1/2 bg-[#9747FF] hover:bg-violet-900 text-white font-base text-center py-2 rounded-md shadow-md transition duration-200"
          >Book Inspection 
          </Link>
          <Link
          to={`/login`} 
          className="w-1/2 bg-[#9747FF] hover:bg-violet-900 text-white font-base text-center py-2 rounded-md shadow-md transition duration-200"
          >Apply 
          </Link>

        </div>

      </div>

      
      {/*Description*/}
      <div className="max-w-7xl mx-auto p-6 text-gray-800 text-base leading-relaxed mb-12">

        <p className="font-semibold text-lg text-[#434343]">
          {propertyData.description}
        </p>
      </div>

      {/*Footer*/}
      <Footer />
    </div>
  );
}