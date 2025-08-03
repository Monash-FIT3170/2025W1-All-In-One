import React, {useState} from "react";
import { FaBath, FaBed, FaCar, FaCouch } from "react-icons/fa";
import {Link, useParams} from "react-router-dom";
import Navbar from "./components/TenNavbar";
import Footer from "./components/Footer";
import PropertyDetailsCard from "../globalComponents/PropertyDetailsCard";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Properties, Photos, Videos, RentalApplications } from "../../api/database/collections";
import {AddTicketDialog} from "./AddTicketDialog";

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This page will display the details of a particular property leased by a Tenant (accessed through BasicLeases) //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default function DetailedLease() {
  const { id } = useParams();
  const [showAddTicketDialog, setShowAddTicketDialog] = useState(false);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [showGeneralDialog, setShowGeneralDialog] = useState(false);

  const closeDialogs = () => {
    setShowAddTicketDialog(false);
    setShowMaintenanceDialog(false);
    setShowGeneralDialog(false);
  };

  const handleTicketSelect = (ticketType) => {
    if (ticketType === 'Maintenance') {
      setShowMaintenanceDialog(true);
      setShowAddTicketDialog(false);
    }
    else {
      setShowGeneralDialog(true);
      setShowAddTicketDialog(false);
    }
  };

  const { loading, property }= useTracker(()=>{
    const propertyHandle= Meteor.subscribe("properties");
    const photoHandle= Meteor.subscribe("photos");
    const videoHandle = Meteor.subscribe("videos")
    const rentalAppHandle= Meteor.subscribe("rentalApplications")

    const isLoading= !propertyHandle.ready() || !photoHandle.ready()|| !videoHandle.ready()|| !rentalAppHandle.ready();
    
    
    if (isLoading) return {loading: true, property: null};

    // find property
    const selectedProperty= Properties.findOne({ prop_id: id });
    if (!selectedProperty) return { loading: false, property: null};

    // finf images
    const photos= Photos.find({ prop_id: id}).fetch();
    const sortedUrls= photos
    .sort((a,b)=> a.photo_order-b.photo_order)
    .map((p) => p.photo_url);

    // get video of the property
    const videos = Videos.find({ prop_id: id }).fetch();
    const videoUrls = videos.map(v => v.video_url);

    // find macthing rental applications to get lease start date if leased
    //const isLeased= selectedProperty.prop_status === "Leased";

    //const leaseStartDate= isLeased ? RentalApplications.findOne({ prop_id: id, status: "Approved"})?.lease_start_date||null
    //:null;

    // find the lease start date if tenant is approved
    const leaseStartDate = RentalApplications.findOne({ 
  prop_id: id, 
  status: "Approved" 
})?.lease_start_date || null;

    return{
      loading: false,
      // data passed on to propertyDetailsCard
      property:{
        id: selectedProperty.prop_id,
        price: selectedProperty.prop_pricepweek,
        address: selectedProperty.prop_address,
        type: selectedProperty.prop_type,
        AvailableDate: selectedProperty.prop_available_date,
        leaseStartDate: leaseStartDate,
        status: selectedProperty.prop_status,
        Pets: selectedProperty.prop_pets?"Yes":"No",
        imageUrls: sortedUrls.length>0? sortedUrls:["/images/default.jpg"],
        videoUrls: videoUrls.length > 0 ? videoUrls : null, 
        description: selectedProperty.prop_desc,
        details:{
          baths: selectedProperty.prop_numbaths,
          beds: selectedProperty.prop_numbeds,
          carSpots: selectedProperty.prop_numcarspots,
          furnished: selectedProperty.prop_furnish? "Yes":"No",
        },
      },
    };
  })
  

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-600">
        Property Not Found!
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#FFF8E9] flex flex-col">
      {/*Header*/}
      <Navbar />

      {/*Main content*/}
      <div className="max-w-7xl mx-auto w-full px-6">
        <PropertyDetailsCard property={property} />
      </div>

      {/*Description and buttons*/}
      <div className="max-w-7xl mx-auto p-6 text-gray-800 text-base leading-relaxed mb-12">
        <p className="font-semibold text-lg text-[#434343]">
          {property.description}
        </p>
      </div>

      {/*Tickets section*/}
      <div className="max-w-7xl mx-auto w-full px-6 mt-8 pt-4 border-t border-gray-300">
        <h2 className="text-4xl mt-8 mb-8 font-bold text-black">Tickets</h2>
      </div>
      <div className="flex justify-center">
        <button
          onClick={() => setShowAddTicketDialog(true)}
          className="w-1/2 bg-[#9747FF] hover:bg-violet-900 text-white font-base text-center py-2 rounded-md shadow-md mb-8 transition duration-200"
        >
          Add Ticket
        </button>
      </div>

      <AddTicketDialog isOpen={showAddTicketDialog} onSelect={handleTicketSelect} onClose={closeDialogs} />

      {/*Footer*/}
      <Footer />
    </div>
  );
}