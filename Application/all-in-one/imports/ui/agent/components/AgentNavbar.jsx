import React from "react";
import NavButton from "../../globalComponents/NavButton";
import { Link, useNavigate } from "react-router-dom";

/**
 * AgentNavbar Component
 * 
 * A navigation bar component specifically designed for authenticated agents.
 * It provides navigation to key agent features and includes logout functionality.
 * 
 * Features:
 * - Logo that links to agent property listings
 * - Dashboard navigation
 * - Applications review navigation
 * - Properties management navigation
 * - Logout functionality
 * - User avatar/profile link
 * - Consistent styling with the application theme
 * 
 * Navigation Routes:
 * - /AgentBasicPropListing - Agent property listings
 * - /AgentDashboard - Agent dashboard
 * - /AgentReviewApplication - Application reviews
 * - /AgentListings - Property management
 * 
 * @returns {JSX.Element} The rendered agent navigation bar component
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
      {/* Logo linked back to agent property listings */}
      <Link
        to="/AgentBasicPropListing"
        className="flex items-center gap-2 h-full"
      >
        <img src="/images/logo.png" alt="Logo" className="h-12" />
      </Link>

      {/* Navigation bar options */}
      <div className="flex items-center gap-4">
        {/* Dashboard navigation */}
        <NavButton to="/AgentDashboard">Dashboard</NavButton>

        {/* Applications review navigation */}
        <NavButton to="/AgentReviewApplication">Applications</NavButton>

        {/* Properties management navigation */}
        <NavButton to="/AgentListings">Properties</NavButton>

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
