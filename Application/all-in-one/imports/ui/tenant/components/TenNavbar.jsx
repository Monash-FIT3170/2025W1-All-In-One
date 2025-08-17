import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Tenants } from "/imports/api/database/collections";
import NavButton from "../../globalComponents/NavButton";

function Navbar() {
  const navigate = useNavigate();
  const tenantID = Meteor.userId();

  // Get the current tenant's profile picture reactively
  const { tenantProfilePic, isLoading } = useTracker(() => {
    const handle = Meteor.subscribe('tenants');
    const tenant = Tenants.findOne({ ten_id: tenantID });
    
    return {
      tenantProfilePic: tenant?.ten_pfp || null,
      isLoading: !handle.ready()
    };
  }, [tenantID]);

  const logout = () => {
    Meteor.logout(() => {
      navigate("/");
    });
  };

  return (
    <div className="flex items-center justify-between px-6 h-[63px] bg-[#CBADD8]">
      {/*Logo linked back to search bar*/}
      <Link to="/TenantBasicPropListings" className="flex items-center gap-2 h-full">
        <img src="/images/logo.png" alt="Logo" className="h-12" />
      </Link>

      {/*Nav bar options*/}
      <div className="flex items-center gap-4">
        {/*TODO: Add route to tenant inspections*/}
        <NavButton to="/InspectionListing">Inspections</NavButton>

        {/*TODO: Add route to tenant's applications*/}
        <NavButton to="/TenantApplications">
          Applications
        </NavButton>

        {/*Route to tenant's properties*/}
        <NavButton to="/BasicLeases">Properties</NavButton>

        {/*TODO: Add logout function*/}
        <NavButton onClick={logout}>
          Log Out
        </NavButton>

        {/*TODO: Add route to the tenant's profile settings*/}
        <Link to="/Settings">
          {isLoading ? (
            <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse" />
          ) : (
            <img
              src={tenantProfilePic || "/images/user-avatar.png"}
              alt="User Avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
          )}
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
