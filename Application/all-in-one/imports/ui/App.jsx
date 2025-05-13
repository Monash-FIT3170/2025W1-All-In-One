import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// importing tenant pages
import BasicLeases from "./tenant/BasicLeases.jsx";
import DetailedLease from "./tenant/DetailedLease.jsx";
import TenantBasicPropListings from "./tenant/TenantBasicPropListings.jsx";
import TenDetailedPropListing from "./tenant/TenDetailedPropListing.jsx";

// importing agent pages
import AddPropertyListing from "./agent/AddPropertyListing.jsx";
import AgentBasicPorpListing from "./agent/AgentBasicPropListing.jsx";
import AgentDetailedListing from "./agent/AgentDetailedListing.jsx";
import AgentDetailedPropListing from "./agent/AgentDetailedPropListing.jsx"
import AgentListings from "./agent/AgentListings.jsx"

// importing landlord pages 
import LandlordBasicPropListings from "./landlord/LandlordBasicPropListings.jsx";
import LandlordDetailedProp from "./landlord/LandLordDetailedProp.jsx";
import LandlordDetailedPropListing from "./landlord/LandlordDetailedPropListing.jsx";
import LandlordProperties from "./landlord/LandlordProperties.jsx";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div>Welcome Page</div>} />

        {/* Tenant Routes */}
        <Route path="/BasicLeases" element={<BasicLeases />} />
        <Route path="/TenantBasicPropListings" element={<TenantBasicPropListings />}/>
        <Route
          path="/TenDetailedPropListing/:id"
          element={<TenDetailedPropListing />}
        />
        <Route
          path="/DetailedLease/:id"
          element={<DetailedLease />}
        />


        {/* Agent Routes */ }
        <Route path="/AddPropertyListing" element={<AddPropertyListing />} />
        <Route path="/AgentBasicPropListing" element={<AgentBasicPorpListing/>}/>
        <Route path="/AgentDetailedListing/:id" element={<AgentDetailedListing/>}/>
        <Route path="/AgentDetailedPropListing/:id" element={<AgentDetailedPropListing/>}/>
        <Route path="/AgentListings" element={<AgentListings/>}/>


        {/*Landlord routes*/}
        <Route path="/LandlordBasicPropListings" element={<LandlordBasicPropListings/>}/>
        <Route path="/LandlordDetailedProp/:id" element={<LandlordDetailedProp/>}/>
        <Route path="/LandlordDetailedPropListing/:id" element={<LandlordDetailedPropListing/>}/>
        <Route path="/LandlordProperties" element={<LandlordProperties/>}/>
        
      </Routes>
    </Router>
  );
}
