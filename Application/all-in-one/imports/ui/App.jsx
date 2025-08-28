// App.js
import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";

// Auth pages
import { LoginPage } from "./globalComponents/LoginPage.jsx";
import { HomePage } from "./globalComponents/HomePage.jsx";
import { SignUpPage } from "./globalComponents/SignUpPage.jsx";

// Route guards
import ProtectedAgentRoutes from "./utils/ProtectedAgentRoutes.jsx";
import ProtectedLandlordRoutes from "./utils/ProtectedLandlordRoutes.jsx";
import ProtectedTenantRoutes from "./utils/ProtectedTenantRoutes.jsx";

// Guest pages
import DetailedPropListing from "./globalComponents/DetailedPropListing.jsx";
import GuestBasicPropListings from "./globalComponents/GuestBasicPropListings.jsx";

// Tenant pages
import BasicLeases from "./tenant/BasicLeases.jsx";
import DetailedLease from "./tenant/DetailedLease.jsx";
import TenantBasicPropListings from "./tenant/TenantBasicPropListings.jsx";
import TenDetailedPropListing from "./tenant/TenDetailedPropListing.jsx";
import Apply from "./tenant/TenantApply.jsx";
import { PropertyListing } from "./tenant/PropertyListing.jsx";
import { InspectionBooking } from "./tenant/InspectionBooking.jsx";
import TenantApplications from "./tenant/TenantApplications.jsx";

// Agent pages
import AddPropertyListing from "./agent/AddPropertyListing.jsx";
import AgentBasicPorpListing from "./agent/AgentBasicPropListing.jsx";
import AgentDetailedListing from "./agent/AgentDetailedListing.jsx";
import AgentDetailedPropListing from "./agent/AgentDetailedPropListing.jsx";
import AgentListings from "./agent/AgentListings.jsx";
import ReviewApplication from "./agent/AgentReviewApplication.jsx";
import AgentDashboard from "./agent/AgentDashboard.jsx";

// Landlord pages
import LandlordBasicPropListings from "./landlord/LandlordBasicPropListings.jsx";
import LandlordDetailedProp from "./landlord/LandLordDetailedProp.jsx";
import LandlordDetailedPropListing from "./landlord/LandlordDetailedPropListing.jsx";
import LandlordProperties from "./landlord/LandlordProperties.jsx";
import LandlordApplications from "./landlord/LandlordApplications.jsx";

const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Guest browsing */}
      <Route path="/GuestBasicListings" element={<GuestBasicPropListings />} />
      <Route path="/GuestDetailedPropListing/:id" element={<DetailedPropListing />} />
      <Route path="/search" element={<GuestBasicPropListings />} />

      {/* -------------------- Tenant (PROTECTED) -------------------- */}
      <Route element={<ProtectedTenantRoutes />}>
        <Route path="/TenantBasicPropListings" element={<TenantBasicPropListings />} />
        <Route path="/TenantApplications" element={<TenantApplications />} />
        {/* Inspection booking */}
        <Route path="/InspectionListing" element={<PropertyListing />} />
        <Route path="/InspectionBooking/:id" element={<InspectionBooking />} />
        {/* Team-2 tenant routes */}
        <Route path="/BasicLeases" element={<BasicLeases />} />
        <Route path="/Apply/:id" element={<Apply />} />
        <Route path="/TenDetailedPropListing/:id" element={<TenDetailedPropListing />} />
        <Route path="/DetailedLease/:id" element={<DetailedLease />} />
      </Route>

      {/* -------------------- Agent (PROTECTED) -------------------- */}
      <Route element={<ProtectedAgentRoutes />}>
        {/* Dashboards */}
        <Route path="/dashboard" element={<AgentDashboard />} />
        <Route path="/AgentDashboard" element={<AgentDashboard />} />
        {/* Listings & details */}
        <Route path="/AddPropertyListing" element={<AddPropertyListing />} />
        <Route path="/AgentBasicPropListing" element={<AgentBasicPorpListing />} />
        <Route path="/AgentDetailedListing/:id" element={<AgentDetailedListing />} />
        <Route path="/AgentDetailedPropListing/:id" element={<AgentDetailedPropListing />} />
        <Route path="/AgentListings" element={<AgentListings />} />
        <Route path="/AgentReviewApplication" element={<ReviewApplication />} />
      </Route>

      {/* -------------------- Landlord (PROTECTED) -------------------- */}
      <Route element={<ProtectedLandlordRoutes />}>
        <Route path="/LandlordBasicPropListings" element={<LandlordBasicPropListings />} />
        {/* Use :id for details; keep both routes if your app links to either */}
        <Route path="/LandlordDetailedProp/:id" element={<LandlordDetailedProp />} />
        <Route path="/LandlordDetailedPropListing/:id" element={<LandlordDetailedPropListing />} />
        <Route path="/LandlordProperties" element={<LandlordProperties />} />
        <Route path="/LandlordApplications" element={<LandlordApplications />} />
      </Route>

      {/* (Optional) 404 route could go here */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  </BrowserRouter>
);

export default App;
