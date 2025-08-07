// App.js
import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { LoginPage } from './globalComponents/LoginPage.jsx';
import { HomePage } from './globalComponents/HomePage.jsx'; 
import { SignUpPage } from './globalComponents/SignUpPage.jsx';
import { Dashboard } from './agent/Dashboard.jsx';


import ProtectedAgentRoutes from './utils/ProtectedAgentRoutes.jsx'; 
import ProtectedLandlordRoutes from './utils/ProtectedLandlordRoutes.jsx';
import ProtectedTenantRoutes from './utils/ProtectedTenantRoutes.jsx';

// Guest pages
import DetailedPropListing from './globalComponents/DetailedPropListing.jsx';
import GuestBasicPropListings from './globalComponents/GuestBasicPropListings.jsx';

// importing tenant pages
import BasicLeases from "./tenant/BasicLeases.jsx";
import DetailedLease from "./tenant/DetailedLease.jsx";
import TenantBasicPropListings from "./tenant/TenantBasicPropListings.jsx";
import TenDetailedPropListing from "./tenant/TenDetailedPropListing.jsx";
import Apply from './tenant/TenantApply.jsx';
import { PropertyListing } from './tenant/PropertyListing.jsx';
import { InspectionBooking } from './tenant/InspectionBooking.jsx';
import TenantApplications from './tenant/TenantApplications.jsx';

// importing agent pages
import AddPropertyListing from "./agent/AddPropertyListing.jsx";
import AgentBasicPorpListing from "./agent/AgentBasicPropListing.jsx";
import AgentDetailedListing from "./agent/AgentDetailedListing.jsx";
import AgentDetailedPropListing from "./agent/AgentDetailedPropListing.jsx"
import AgentListings from "./agent/AgentListings.jsx"
import ReviewApplication from "./agent/AgentReviewApplication.jsx"
import AgentDashboard from './agent/AgentDashboard.jsx';

// importing landlord pages 
import LandlordBasicPropListings from "./landlord/LandlordBasicPropListings.jsx";
import LandlordDetailedProp from "./landlord/LandLordDetailedProp.jsx";
import LandlordDetailedPropListing from "./landlord/LandlordDetailedPropListing.jsx";
import LandlordProperties from "./landlord/LandlordProperties.jsx";

/**
 * Main Application Component
 * 
 * This is the root component that handles all routing for the real estate application.
 * It provides different routes for different user types (guests, tenants, agents, landlords)
 * and implements protected routing for authenticated users.
 * 
 * Route Structure:
 * - Public routes: Home, Login, SignUp, Guest property listings
 * - Protected Tenant routes: Property listings, applications, inspections, leases
 * - Protected Agent routes: Dashboard, property management, application reviews
 * - Protected Landlord routes: Property listings and management
 * 
 * @returns {JSX.Element} The main application component with routing
 */
const App = () => (
  <BrowserRouter>
    <div>
      <Routes>

        {/* Public Routes - Accessible to all users */}
        
        {/* Home Page - Landing page for the application */}
        <Route path="/" element={<HomePage />} />

        {/* Authentication Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Guest Routes - Property viewing for non-authenticated users */}
        <Route path="/GuestBasicListings" element={<GuestBasicPropListings/>} />
        <Route path="/GuestDetailedPropListing/:id" element={<DetailedPropListing/>} />
        
        {/* Search functionality - redirects to guest listings */}
        <Route path="/search" element={<GuestBasicPropListings />} />

        {/* Protected Tenant Routes - Require tenant authentication */}
        <Route element={<ProtectedTenantRoutes />}>
          {/* Tenant Property Listings */}
          <Route path="/TenantBasicPropListings" element={<TenantBasicPropListings />}/>
          <Route path="/TenantApplications" element={<TenantApplications/>}/>
         
          {/* Inspection and Booking Functionality */}
          <Route path="/InspectionListing" element={<PropertyListing />}/>
          <Route path="/InspectionBooking/:id" element={<InspectionBooking/>}/>
          
          {/* Tenant Application and Lease Management */}
          <Route path="/BasicLeases" element={<BasicLeases />} />
          <Route path="/Apply/:id" element={<Apply />} />
          <Route
            path="/TenDetailedPropListing/:id"
            element={<TenDetailedPropListing />}
          />
          <Route
            path="/DetailedLease/:id"
            element={<DetailedLease />}
          />
        </Route>

        {/* Protected Agent Routes - Require agent authentication */}
        <Route element={<ProtectedAgentRoutes />}>
          
          {/* Agent Dashboard and Management */}
          <Route path="/dashboard" element={<AgentDashboard />} /> {/* Dashboard after log in */}
          <Route path="/AgentDashboard" element={<AgentDashboard />} /> {/* Proper dashboard */}

          {/* Agent Property Management */}
          <Route path="/AddPropertyListing" element={<AddPropertyListing />} />
          <Route path="/AgentBasicPropListing" element={<AgentBasicPorpListing/>}/>
          <Route path="/AgentDetailedListing/:id" element={<AgentDetailedListing/>}/>
          <Route path="/AgentDetailedPropListing/:id" element={<AgentDetailedPropListing/>}/>
          <Route path="/AgentListings" element={<AgentListings/>}/>
          <Route path="/AgentReviewApplication" element={<ReviewApplication/>}/>
        </Route>
        
        {/* Protected Landlord Routes - Require landlord authentication */}
        <Route element={<ProtectedLandlordRoutes />}>
          {/* Landlord Property Management */}
          <Route path="/LandlordBasicPropListings" element={<LandlordBasicPropListings/>}/>
          <Route path="/LandlordDetailedPropListing" element={<LandlordDetailedPropListing />} />

          {/* Landlord Detailed Property Views */}
          <Route path="/LandlordDetailedProp/:id" element={<LandlordDetailedProp/>}/>
          <Route path="/LandlordDetailedPropListing" element={<LandlordDetailedPropListing/>}/>
          <Route path="/LandlordProperties" element={<LandlordProperties/>}/>
        </Route> 

      </Routes>
    </div>
  </BrowserRouter>  
);
export default App;
