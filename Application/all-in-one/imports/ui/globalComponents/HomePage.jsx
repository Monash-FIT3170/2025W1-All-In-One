// HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";

/**
 * HomePage Component
 * 
 * This is the main landing page of the real estate application. It serves as the entry point
 * for users and provides navigation to key features like login, signup, and property search.
 * 
 * Features:
 * - Gradient background with purple theme
 * - Login and Sign Up buttons in the top right
 * - Main application title "All In One"
 * - Search functionality for properties, agents, or locations
 * - Application logo display
 * 
 * @returns {JSX.Element} The rendered home page component
 */
export const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#C7A4E0] via-[#E2D4F5] via-[#E2D4F5] to-[#C7A4E0] relative">
      
      {/* Top right navigation buttons - Login and Sign Up */}
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

      {/* Application tagline */}
      <div className="text-center mb-4">
        <p className="text-2xl text-[#4B2B62] font-semibold">Your One Stop for Rental Solutions</p>
      </div>

      {/* Main application title */}
      <h1 className="text-7xl font-extrabold text-[#6E3BAA] uppercase tracking-wide drop-shadow-md mb-6">
        All In One
      </h1>

      {/* Search functionality - Search bar with enter button */}
      <div className="w-full max-w-xl px-6 mb-6 flex gap-3">
        <input
          type="text"
          placeholder="Search listings, agents, or locations..."
          className="w-full p-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B57FE6] text-[#4B2B62]"
        />
        <Link
          to="/search" 
          className="bg-[#B57FE6] hover:bg-[#A260D1] text-white font-bold px-6 py-2 rounded-full flex items-center justify-center no-underline"
        >
          Enter
        </Link>
      </div>

      {/* Application logo */}
      <img src="/images/logo.png" alt="Logo" className="w-40 h-40 mb-8" />
    </div>
  );
};
