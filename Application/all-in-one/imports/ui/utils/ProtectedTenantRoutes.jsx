import { Outlet, Navigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import React from 'react';

/**
 * ProtectedTenantRoutes Component
 * 
 * A route protection component that ensures only authenticated tenants
 * can access tenant-specific routes. This component checks the user's
 * role and redirects to login if the user is not a tenant.
 * 
 * Features:
 * - Checks if user is authenticated and has 'tenant' role
 * - Redirects to login page if user is not authorized
 * - Allows access to protected routes if user is authorized
 * - Uses React Router's Outlet for nested routing
 * 
 * Usage:
 * This component should wrap tenant-specific routes in the router
 * configuration to ensure proper access control.
 * 
 * @returns {JSX.Element} The protected routes component or redirect
 */
const ProtectedTenantRoutes = () => {
  // Get the user's role from their profile
  const userRole = Meteor.user()?.profile?.role;

  return (
    <div>
      {userRole === 'tenant' ? (
        // User is authorized - render the protected routes
        <Outlet />
      ) : (
        // User is not authorized - redirect to login
        <Navigate to="/login" replace />
      )}
    </div>
  );
}

export default ProtectedTenantRoutes;
