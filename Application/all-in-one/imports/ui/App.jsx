import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// importing tenant pages
import BasicLeases from "./Tenant/BasicLeases.jsx";
import DetailedLease from "./Tenant/DetailedLease.jsx";
import TenantBasicPropListings from "./Tenant/TenantBasicPropListings.jsx";
import TenDetailedPropListing from "./Tenant/TenDetailedPropListing.jsx";

// importing agent pages
import AddPropertyListing from "./Agent/AddPropertyListing.jsx";
import AgentBasicPorpListing from "./Agent/AgentBasicPropListing.jsx";
import AgentDetailedListing from "./Agent/AgentDetailedListing.jsx";
import AgentDetailedPropListing from "./Agent/AgentDetailedPropListing.jsx"
import AgentListings from "./Agent/AgentListings.jsx"

// importing landlord pages 
import LandlordBasicPropListings from "./LandLord/LandlordBasicPropListings.jsx";
import LandlordDetailedProp from "./LandLord/LandLordDetailedProp.jsx";
import LandlordDetailedPropListing from "./LandLord/LandlordDetailedPropListing.jsx";
import LandlordProperties from "./LandLord/LandlordProperties.jsx";


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
