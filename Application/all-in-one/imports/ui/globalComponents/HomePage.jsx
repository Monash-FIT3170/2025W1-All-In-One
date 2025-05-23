// HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";

export const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#C7A4E0] via-[#E2D4F5] via-[#E2D4F5] to-[#C7A4E0] relative">
      
      {/* Top right buttons */}
      <div className="absolute top-6 right-6 flex gap-4">
        <Link to="/login">
          <button className="bg-[#B57FE6] hover:bg-[#A260D1] text-white font-bold py-2 px-5 rounded-full">
            Log In
          </button>
        </Link>
        <Link to="/signup">
          <button className="bg-[#B57FE6] hover:bg-[#A260D1] text-white font-bold py-2 px-5 rounded-full">
            Sign Up
          </button>
        </Link>
      </div>

      {/* Tagline */}
      <div className="text-center mb-4">
        <p className="text-2xl text-[#4B2B62] font-semibold">Your One Stop for Rental Solutions</p>
      </div>

      {/* Main Title */}
      <h1 className="text-7xl font-extrabold text-[#6E3BAA] uppercase tracking-wide drop-shadow-md mb-6">
        All In One
      </h1>

      {/* Search Bar */}
      <div className="w-full max-w-xl px-6 mb-6">
        <input
          type="text"
          placeholder="Search listings, agents, or locations..."
          className="w-full p-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B57FE6] text-[#4B2B62]"
        />
      </div>

      {/* Logo */}
      <img src="/images/logo.png" alt="Logo" className="w-40 h-40 mb-8" />
    </div>
  );
};
