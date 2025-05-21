// HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";

export const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#efe3ff] via-[#f2defa] to-[#ab79ed] relative">


      {/* Top right buttons */}
      <div className="absolute top-6 right-6 flex gap-4">
        <Link to="/login">
          <button className="bg-[#9747FF] hover:bg-[#7E35D4] text-white font-bold py-2 px-5 rounded-full">
            Log In
          </button>
        </Link>
        <Link to="/signup">
          <button className="bg-[#9747FF] hover:bg-[#7E35D4] text-white font-bold py-2 px-5 rounded-full">
            Sign Up
          </button>
        </Link>
      </div>

      {/* Tagline (smaller text above logo) */}
      <div className="text-center mb-4">
        <p className="text-2xl text-gray-700 font-semibold">Your One Stop for Rental Solutions</p>
      </div>

      

      {/* Main Title */}
      <h1 className="text-7xl font-extrabold text-[#424242] uppercase tracking-wide">
        All In One
      </h1>

      {/* Logo */}
      <img src="/images/logo.png" alt="Logo" className="w-40 h-40 mb-8" />

    </div>
  );
};