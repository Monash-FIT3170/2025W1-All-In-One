import React from "react";
import { Link, useNavigate } from "react-router-dom";
import NavButton from "../../globalComponents/NavButton";

/**
 * LandlordNavbar Component
 * 
 * A navigation bar component specifically designed for authenticated landlords.
 * It provides navigation to key landlord features and includes logout functionality.
 * 
 * Features:
 * - Logo that links to landlord property listings
 * - Applications review navigation
 * - Properties management navigation
 * - Logout functionality
 * - User avatar/profile link
 * - Consistent styling with the application theme
 * 
 * Navigation Routes:
 * - /LandlordBasicPropListings - Landlord property listings
 * - /LandlordDetailedPropListing - Application reviews
 * - /LandlordProperties - Property management
 * 
 * @returns {JSX.Element} The rendered landlord navigation bar component
 */
function Navbar() {
  const navigate = useNavigate();

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
      {/* Logo linked back to landlord property listings */}
      <Link
        to="/LandlordBasicPropListings"
        className="flex items-center gap-2 h-full"
      >
        <img src="/images/logo.png" alt="Logo" className="h-12" />
      </Link>

      {/* Navigation bar options */}
      <div className="flex items-center gap-4">
        {/* Applications review navigation */}
        <NavButton to="/LandlordDetailedPropListing">Applications</NavButton>

        {/* Properties management navigation */}
        <NavButton to="/LandlordProperties">Properties</NavButton>

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
