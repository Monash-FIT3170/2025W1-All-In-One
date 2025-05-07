import React, { useEffect, useState } from "react";
import { Meteor } from "meteor/meteor";
import { Link, useNavigate } from "react-router-dom";
import { Tracker } from "meteor/tracker";

export const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const tracker = Tracker.autorun(() => {
      setUser(Meteor.user());
    });
    return () => tracker.stop();
  }, []);

  const handleLogout = () => {
    Meteor.logout(() => {
      navigate("/login");
    });
  };

  return (
    <nav className="bg-[#FFF7E6] p-4 flex justify-between items-center shadow-md">
      {/* Left side - Logo */}
      <Link to="/" className="text-xl font-bold text-black flex items-center gap-2">
        <img src="/images/logo.png" alt="Logo" className="h-8" />
        <span>All In One Rentals</span>
      </Link>

      {/* Right side - Auth options */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-black font-medium">
              Welcome, {user.profile?.firstName || "User"}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-4 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="bg-[#F3D673] hover:bg-yellow-400 text-black font-bold py-1 px-4 rounded no-underline">
              Log In
            </Link>
            <Link to="/signup" className="bg-[#F3D673] hover:bg-yellow-400 text-black font-bold py-1 px-4 rounded no-underline">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
