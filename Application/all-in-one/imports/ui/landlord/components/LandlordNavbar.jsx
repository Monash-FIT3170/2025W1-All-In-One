import React from 'react';
import { Link } from 'react-router-dom'; 

function Navbar() {
  return (
    <div className="flex items-center justify-between px-8 py-4 bg-[#D6F2F2]">
      <Link to="/" className="flex items-center gap-2">
        <img src="/images/logo.png" alt="Logo" className="h-12" />
        <span className="text-xl font-bold">All In One</span>
      </Link> 
      <div className="flex items-center gap-4">
        {['Applications','Properties'].map((label) => (
          label === 'Properties' ? (
            <Link
              key={label}
              to="/LandlordProperties"
              className="bg-yellow-300 px-4 py-2 rounded-full font-semibold hover:bg-yellow-400 transition flex items-center justify-center"
            >
              {label}
            </Link>
          ) : (
            <button
              key={label}
              className="bg-yellow-300 px-4 py-2 rounded-full font-semibold hover:bg-yellow-400 transition"
            >
              {label}
            </button>
          )
        ))}
        <button className="bg-yellow-300 px-4 py-2 rounded-full font-semibold hover:bg-yellow-400 transition">
          Log out
        </button>
        <img src="/images/user-avatar.png" alt="User Avatar" className="w-10 h-10 rounded-full" />
      </div>
    </div>
  );
}

export default Navbar;