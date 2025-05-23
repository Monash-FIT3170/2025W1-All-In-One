import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage.jsx';
import { HomePage } from './HomePage.jsx'; 
import { SignUpPage } from './SignUpPage.jsx';
import { Dashboard } from '../agent/Dashboard.jsx';
import { SignedInTenant } from '../tenant/SignedInTenant.jsx';
import { SignedInLandlord } from '../landlord/SignedInLandlord.jsx'; 
import ProtectedAgentRoutes from '../utils/ProtectedAgentRoutes.jsx'; 
import ProtectedLandlordRoutes from '../utils/ProtectedLandlordRoutes.jsx';
import ProtectedTenantRoutes from '../utils/ProtectedTenantRoutes.jsx'; 


export const App = () => (
  <BrowserRouter>
    <div>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* Login Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Sign Up Page */}
        <Route path="/signup" element={<SignUpPage />} />

        {/* Protected Tenant Routes */}
        <Route element={<ProtectedTenantRoutes />}>

          {/* Signed In Tenant Page */}
          <Route path="/signedInTenant" element={<SignedInTenant />} />
          
          {/* Add any other protected tenant routes here */}



        </Route>

        {/* Protected Agent Routes */}
        <Route element={<ProtectedAgentRoutes />}>
          
          {/* Dashboard Page*/}
          <Route path="/dashboard" element={<Dashboard/>} />
        
          {/* Add any other protected agent routes here */}
        


        </Route>
        
        {/* Protected Landlord Routes */}
        <Route element={<ProtectedLandlordRoutes />}>
          {/* Signed In Landlord Page*/}
          <Route path="/signedInLandlord" element={<SignedInLandlord/>} />

          {/* Add any other protected routes here */}
        


        </Route> 

      </Routes>
    </div>
  </BrowserRouter>  
);
