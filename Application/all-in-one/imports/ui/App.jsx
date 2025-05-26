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

// Guest pagess
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


const App = () => (
  <BrowserRouter>
    <div>
      <Routes>



        {/* Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* Login Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Sign Up Page */}
        <Route path="/signup" element={<SignUpPage />} />

        {/*Guest basic leases and detailed listing page*/}
              <Route path="/GuestBasicListings" element={<GuestBasicPropListings/>} />
              <Route path="/GuestDetailedPropListing/:id" element={<DetailedPropListing/>} />
              
        {/* ROUTING gues to view properties */}
                <Route path="/search" element={<GuestBasicPropListings />} />

        {/* Protected Tenant Routes */}
        <Route element={<ProtectedTenantRoutes />}>

          {/* Signed In Tenant Page */}
          <Route path="/TenantBasicPropListings" element={<TenantBasicPropListings />}/>
         
          
          {/* Add any other protected tenant routes here */}

          {/* Inspection Booking Page */}
          <Route path="/InspectionListing" element={<PropertyListing />}/>
          <Route path="/InspectionBooking" element={<InspectionBooking/>}/>
          
          {/* Tenant Routes - team-2*/}
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

        {/* Protected Agent Routes */}
        <Route element={<ProtectedAgentRoutes />}>
          
          {/* Dashboard Page*/}
          <Route path="/dashboard" element={<AgentDashboard />} /> {/* Dashboard after log in */}
          <Route path="/AgentDashboard" element={<AgentDashboard />} /> {/* Proper dashboard */}

        
          {/* Add any other protected agent routes here */}
          {/* Agent Routes team-2 */ }
                  <Route path="/AddPropertyListing" element={<AddPropertyListing />} />
                  <Route path="/AgentBasicPropListing" element={<AgentBasicPorpListing/>}/>
                  <Route path="/AgentDetailedListing/:id" element={<AgentDetailedListing/>}/>
                  <Route path="/AgentDetailedPropListing/:id" element={<AgentDetailedPropListing/>}/>
                  <Route path="/AgentListings" element={<AgentListings/>}/>
                  <Route path="/AgentReviewApplication" element={<ReviewApplication/>}/>
          
          
        


        </Route>
        
        {/* Protected Landlord Routes */}
        <Route element={<ProtectedLandlordRoutes />}>
          {/* Signed In Landlord Page*/}
          <Route path="/LandlordBasicPropListings" element={<LandlordBasicPropListings/>}/>
          

          {/* Add any other protected routes here */}
          {/*Landlord routes- team 2*/}
                  
                  <Route path="/LandlordDetailedProp/:id" element={<LandlordDetailedProp/>}/>
                  <Route path="/LandlordDetailedPropListing/:id" element={<LandlordDetailedPropListing/>}/>
                  <Route path="/LandlordProperties" element={<LandlordProperties/>}/>
                  
        


        </Route> 

      </Routes>
    </div>
  </BrowserRouter>  
);
export default App;
