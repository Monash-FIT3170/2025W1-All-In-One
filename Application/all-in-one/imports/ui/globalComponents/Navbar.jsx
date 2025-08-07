import React from "react";
import { Link } from "react-router-dom";
import NavButton from "./NavButton";

/**
 * NavBar Component
 * 
 * A navigation bar component that provides the main navigation interface
 * for the application. It displays the logo and navigation buttons for
 * user authentication.
 * 
 * Features:
 * - Application logo that links to guest property listings
 * - Sign Up and Log In navigation buttons
 * - Consistent styling with the application theme
 * 
 * @returns {JSX.Element} The rendered navigation bar component
 */
function NavBar() {
  return (
    <div className="flex items-center justify-between px-6 h-[63px] bg-[#CBADD8]">
      {/* Logo linked back to search bar */}
      <Link to="/GuestBasicListings" className="flex items-center gap-2 h-full">
        <img src="/images/logo.png" alt="Logo" className="h-12" />
      </Link>

      {/* Navigation bar options */}
      <div className="flex items-center gap-4">
        <NavButton to="/signup">Sign Up</NavButton>
        <NavButton to="/login">Log in</NavButton>
      </div>
    </div>
  );
}

export default NavBar;
