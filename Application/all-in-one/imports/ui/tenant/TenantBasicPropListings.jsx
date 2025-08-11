import React from "react";
import { FaBath, FaBed, FaCar, FaCouch , FaSearch, FaFilter, FaStar} from "react-icons/fa";
import { Link } from "react-router-dom";
import Navbar from "./components/TenNavbar";
import Footer from "./components/Footer";
import BasicPropertyCard from "../globalComponents/BasicPropertyCard";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Properties, Photos, StarredProperties, Tenants } from "../../api/database/collections"; // importing mock for now

export default function TenantBasicPropListings() {
  const [showOnlySaved, setShowOnlySaved]= React.useState(false); // used to show only the saved properties

  const { isReady, properties, photos, starredProperties }=  useTracker(()=>{
      const subProps= Meteor.subscribe("properties");
      const subPhotos= Meteor.subscribe("photos");
      const subStarred= Meteor.subscribe("starredProperties");
      const subTenants= Meteor.subscribe("tenants");
  
      const isReady= subProps.ready() && subPhotos.ready() && subStarred.ready() && subTenants.ready();
      
      const properties= isReady ? Properties.find().fetch(): [];
      const photos= isReady ? Photos.find().fetch(): [];
      const tenant= Tenants.findOne({ ten_id: Meteor.userId() });

      const starredProperties= isReady && tenant ?
        StarredProperties.find({ ten_id: tenant.ten_id }).fetch() : [];
      
      return { isReady, properties, photos, starredProperties };
  
    }, [showOnlySaved, Meteor.userId()]);

    // Track starred properties in state for instant updates
  const [locallyStarred, setLocallyStarred] = React.useState(new Set());
  React.useEffect(() => {
    // Sync with server data when it changes
    setLocallyStarred(new Set(starredProperties.map(sp => sp.prop_id)));
  }, [starredProperties]);
  
    if (!isReady){
      return <div className="text-center text-gray-600 mt-10">Loading Properties...</div>;
    }


    const availableProperties= properties.filter(
    (p)=> p.prop_status==="Available"
  );

  const starredSet= new Set(starredProperties.map(sp => sp.prop_id));
  console.log("Starred properties:", starredProperties.map(sp => sp.prop_id));
  
    const propertyCards= availableProperties
    .filter(p=> showOnlySaved ? locallyStarred.has(p.prop_id) : true)
    .map((p)=>{
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
        starred: locallyStarred.has(p.prop_id),
      onStarToggle: (propId, newStarred) => {
        // Optimistic local update
        setLocallyStarred(prev => {
          const newSet = new Set(prev);
          newStarred ? newSet.add(propId) : newSet.delete(propId);
          return newSet;
        });
      }
    };
    });

    console.log("All property IDs:", availableProperties.map(p => p.prop_id));
console.log("Starred set:", [...starredSet]);

  return (
    <div className="min-h-screen bg-[#FFF8E9] flex flex-col">
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
          />
        </div>
      </div>

      {/* Search + Filters */}
            <div className="mt-4 flex justify-center">
              <div className="bg-[#CBADD8] p-4 rounded-lg flex gap-4 w-full" style={{ maxWidth: '1185px' }}>
                {/* saved listings toggle button*/}
                <button
                onClick={() => setShowOnlySaved(!showOnlySaved)}
               className={`flex items-center justify-center ${
  showOnlySaved ? 'bg-[#7d3dd1]' : 'bg-[#9747FF]'
} hover:bg-[#7d3dd1] text-white px-4 py-2 rounded-md`}
                >
                  {showOnlySaved ? (
                    <>
                    <FaStar className="mr-2" />
                    Show All
                    </>
                  ) : (
                    <>
                    <FaStar className="mr-2" />
                    Saved Only 
                    </>
                  )
                  }
                  </button>
                
                {/* Search field */}
                <div className="flex items-center bg-white px-3 py-2 rounded-md w-full">
                  <FaSearch className="text-gray-500 mr-2" />
                  <input
                    type="text"
                    placeholder="Search Postcode..."
                    className="flex-1 outline-none bg-transparent"
                  />
                </div>
      
                {/* Search button with icon */}
                <button
                  className="flex items-center justify-center bg-[#9747FF] hover:bg-[#7d3dd1] text-white px-4 py-2 rounded-md"
                >
                  <FaSearch className="mr-2" />
                  Search
                </button>
      
                {/* Filter button with icon */}
                <button
                  className="flex items-center justify-center bg-[#9747FF] hover:bg-[#7d3dd1] text-white px-4 py-2 rounded-md"
                >
                  <FaFilter className="mr-2" />
                  Filter
                </button>
              </div>
            </div>

      {/* Property Grid */}
      <div className="mt-8 w-full flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-20 w-full max-w-[1230px] px-6">
          {propertyCards.map((property) => (
            
              <BasicPropertyCard 
              key={property.id}
              property={property} 
              showFav={true} 
              linkTo={`/TenDetailedPropListing/${property.id}`}
              onStarToggle={property.onStarToggle}
              />
    
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
