import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link
  } from 'react-router-dom';

export default function Test() {

  return (
    <div className="min-h-screen bg-[#FFF8EB] flex flex-col">
      {/*Header*/}
      <div className="flex items-center justify-between px-8 py-4 bg-[#CEF4F1]">
        <div className="flex items-center gap-2">
          <img src="/images/logo.png" alt="Logo" className="h-12" />
          <span className="text-xl font-bold">All In One</span>
        </div>
        <div className="flex gap-4">
          {["Messages", "Applications", "Tickets", "Properties"].map(
            (label) => (
              <button
                key={label}
                className="bg-yellow-300 px-4 py-2 rounded-full font-semibold"
              >
                {label}
              </button>
            )
          )}
          <Link to='/' className="bg-yellow-300 px-4 py-2 rounded-full font-semibold">
            Log out
          </Link>
          <img
            src="/images/user-avatar.png"
            alt="User"
            className="w-10 h-10 rounded-full"
          />
        </div>
      </div>
      <h1>Test page for Links</h1>

      <footer className="bg-[#CEF4F1] text-white py-6 mt-auto"></footer>
    </div>
  );
}
