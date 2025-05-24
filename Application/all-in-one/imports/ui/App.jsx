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
import BasicPropListing from './globalComponents/BasicPropListing.jsx';
import DetailedPropListing from './globalComponents/DetailedPropListing.jsx';

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
              <Route path="/GuestBasicLeases" element={<BasicPropListing/>} />
              <Route path="/GuestDetailedPropListing/:id" element={<DetailedPropListing/>} />

        {/* Protected Tenant Routes */}
        <Route element={<ProtectedTenantRoutes />}>

          {/* Signed In Tenant Page */}
          <Route path="/TenantBasicPropListings" element={<TenantBasicPropListings />}/>
         
          
          {/* Add any other protected tenant routes here */}
          {/* Tenant Routes - team-2*/}
                  <Route path="/BasicLeases" element={<BasicLeases />} />
                  
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
          <Route path="/dashboard" element={<Dashboard/>} />
        
          {/* Add any other protected agent routes here */}
          {/* Agent Routes team-2 */ }
                  <Route path="/AddPropertyListing" element={<AddPropertyListing />} />
                  <Route path="/AgentBasicPropListing" element={<AgentBasicPorpListing/>}/>
                  <Route path="/AgentDetailedListing/:id" element={<AgentDetailedListing/>}/>
                  <Route path="/AgentDetailedPropListing/:id" element={<AgentDetailedPropListing/>}/>
                  <Route path="/AgentListings" element={<AgentListings/>}/>
          
          
        


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
