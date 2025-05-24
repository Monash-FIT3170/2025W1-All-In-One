import React from "react";
import { Link } from "react-router-dom";
import NavButton from "../../globalComponents/NavButton";

function Navbar() {
  return (
    <div className="flex items-center justify-between px-6 h-[63px] bg-[#CBADD8]">
      {/*Logo linked back to search bar*/}
      <Link
        to="/LandlordBasicPropListings"
        className="flex items-center gap-2 h-full"
      >
        <img src="/images/logo.png" alt="Logo" className="h-12" />
      </Link>

      {/*Nav bar options*/}
      <div className="flex items-center gap-4">
        {/*TODO: Add route to Landlord applications*/}
        <NavButton to="/PLACEHOLDER">Applications</NavButton>

        {/*Route to properties connected to landloard*/}
        <NavButton to="/LandlordProperties">Properties</NavButton>

        {/*TODO: Add logout function*/}
        <NavButton onClick={() => console.log("Logout clicked")}>
          Log Out
        </NavButton>

        {/*TODO: Add route to the Landlord's profile settings*/}
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
