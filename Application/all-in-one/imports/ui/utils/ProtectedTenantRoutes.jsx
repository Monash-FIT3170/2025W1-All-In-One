import { Outlet, Navigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import React from 'react';

const ProtectedTenantRoutes = () => {
  const userRole = Meteor.user()?.profile?.role; // Get the user's role

  return (
    <div>
      {userRole === 'tenant' ? (
        <Outlet />
      ) : (
        <Navigate to="/login" replace /> // Redirect to login if not logged in
      )}
    </div>
  );
}
export default ProtectedTenantRoutes;
