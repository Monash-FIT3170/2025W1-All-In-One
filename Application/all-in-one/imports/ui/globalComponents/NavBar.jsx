import React from "react";
import { Link } from "react-router-dom";
import NavButton from "./NavButton";

function NavBar() {
  return (
    <div className="flex items-center justify-between px-6 h-[63px] bg-[#CBADD8]">
      {/*Logo linked back to search bar*/}
      <Link to="/BasicPropListings" className="flex items-center gap-2 h-full">
        <img src="/images/logo.png" alt="Logo" className="h-12" />
      </Link>

      {/*Nav bar options*/}
      <div className="flex items-center gap-4">
        <NavButton to="/signup">Sign Up</NavButton>

        <NavButton to="/login">Log in</NavButton>

      </div>
    </div>
  );
}

export default NavBar;
