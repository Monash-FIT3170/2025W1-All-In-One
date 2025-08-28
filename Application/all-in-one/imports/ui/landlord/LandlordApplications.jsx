import React from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import Navbar from "./components/LandlordNavbar";
import Footer from "./components/Footer";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Photos, RentalApplications } from "../../api/database/collections"; // importing mock for now
import { mockData } from "../../api/database/mockData";
import LandlordApplicationCard from "./components/LandlordApplicationCard";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This page will display all the applications to the Landlord //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default function LandlordApplications() {
  const { isReady, applications, photos } = useTracker(() => {
    const subAppls = Meteor.subscribe("rentalApplications");
    const subPhotos = Meteor.subscribe("photos");

    const isReady = subAppls.ready() && subPhotos.ready();

    const landlord = Meteor.user();
    const LandLordId = "L001"; // Placeholder for Landlord ID, replace with actual logic to get Landlord ID

    // const LandLordId = landlord?._id;
    const applications = isReady ? RentalApplications.find().fetch() : [];

    const photos = isReady ? Photos.find().fetch() : [];

    // Debugging output to check if applications are fetched correctly according to Landlord ID
    console.log("LandLordId:", LandLordId);
    console.log("Fetched applications:", applications);

    return { isReady, applications, photos };
  });

  if (!isReady) {
    return (
      <div className="text-center text-gray-600 mt-10">
        Loading applications...
      </div>
    );
  }

  // Helper: Calculate age from DOB
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Pair each tenant with a property manually
  const tenantsWithProperties = mockData.rentalApplications
    .slice(0, mockData.properties.length)
    .map((application, idx) => {
      const property = mockData.properties[idx];
      const tenant = mockData.tenants.find(
        (t) => t.ten_id === application.ten_id
      );
      const employment = mockData.employment.find(
        (emp) => emp.ten_id === application.ten_id
      );

      return {
        ...application,
        property: {
          image: `/images/properties/${property.prop_id}/main.jpg`,
          address: property.prop_address,
          price: property.prop_pricepweek,
          bedrooms: property.prop_numbeds,
          bathrooms: property.prop_numbaths,
          parking: property.prop_numcarspots,
        },
        tenant: tenant
          ? {
              firstName: tenant.ten_fn,
              lastName: tenant.ten_ln,
            }
          : null,
        age: tenant ? calculateAge(tenant.ten_dob) : "—",
        occupation: employment ? employment.emp_job_title : "—",
      };
    });

  return (
    <div className="min-h-screen bg-[#FFF8E9] flex flex-col">
      {/*Header*/}
      <Navbar />

      {/* Page Heading */}
      <div className="max-w-7xl mx-auto w-full px-6 mt-6">
        <div className="pl-6">
          <h1 className="text-3xl font-medium text-gray-800">
            Your Properties
          </h1>
          <p className="text-gray-600 text-base mt-1">
            All your applications in one place!
          </p>
          <hr className="my-6 border-t-2 border-gray-300 w-full" />
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mt-4 flex justify-center">
        <div
          className="bg-[#CBADD8] p-4 rounded-lg flex gap-4 w-full"
          style={{ maxWidth: "1185px" }}
        >
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
          <button className="flex items-center justify-center bg-[#9747FF] hover:bg-[#7d3dd1] text-white px-4 py-2 rounded-md">
            <FaSearch className="mr-2" />
            Search
          </button>

          {/* Filter button with icon */}
          <button className="flex items-center justify-center bg-[#9747FF] hover:bg-[#7d3dd1] text-white px-4 py-2 rounded-md">
            <FaFilter className="mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Property Grid */}
      <div className="mt-8 w-full flex justify-center">
        <div className="flex flex-col gap-8 w-full max-w-[1230px] px-6">
          {tenantsWithProperties.map((application, index) => (
            <LandlordApplicationCard key={index} application={application} />
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
