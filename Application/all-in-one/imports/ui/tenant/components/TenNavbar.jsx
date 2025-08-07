import React from "react";
import { Link, useNavigate } from "react-router-dom";
import NavButton from "../../globalComponents/NavButton";

/**
 * TenNavbar Component
 * 
 * A navigation bar component specifically designed for authenticated tenants.
 * It provides navigation to key tenant features and includes logout functionality.
 * 
 * Features:
 * - Logo that links to tenant property listings
 * - Inspections booking navigation
 * - Applications management navigation
 * - Properties/leases navigation
 * - Logout functionality
 * - User avatar/profile link
 * - Consistent styling with the application theme
 * 
 * Navigation Routes:
 * - /TenantBasicPropListings - Tenant property listings
 * - /InspectionListing - Inspection bookings
 * - /TenantApplications - Application management
 * - /BasicLeases - Properties and leases
 * 
 * @returns {JSX.Element} The rendered tenant navigation bar component
 */
function Navbar() {
  const navigate = useNavigate();
  const tenantID = Meteor.userId();

  /**
   * Handles user logout by calling Meteor logout and redirecting to home page
   */
  const logout = () => {
    Meteor.logout(() => {
      navigate("/");
    });
  };

  return (
    <div className="flex items-center justify-between px-6 h-[63px] bg-[#CBADD8]">
      {/* Logo linked back to tenant property listings */}
      <Link to="/TenantBasicPropListings" className="flex items-center gap-2 h-full">
        <img src="/images/logo.png" alt="Logo" className="h-12" />
      </Link>

      {/* Navigation bar options */}
      <div className="flex items-center gap-4">
        {/* Inspections booking navigation */}
        <NavButton to="/InspectionListing">Inspections</NavButton>

        {/* Applications management navigation */}
        <NavButton to="/TenantApplications">
          Applications
        </NavButton>

        {/* Properties and leases navigation */}
        <NavButton to="/BasicLeases">Properties</NavButton>

        {/* Logout functionality */}
        <NavButton onClick={logout}>
          Log Out
        </NavButton>

        {/* User avatar/profile link */}
        <Link to="/PLACEHOLDER">
          <img
            src="/images/user-avatar.png"
            alt="User Avatar"
            className="w-10 h-10 rounded-full"
          />
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
