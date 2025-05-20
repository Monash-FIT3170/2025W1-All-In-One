import React from 'react';
import { Link } from 'react-router-dom'; 

function Navbar() {
  return (
    <div className="flex items-center justify-between px-6 h-[63px] bg-[#CBADD8]">
      <Link to="/" className="flex items-center gap-2 h-full">
        <img src="/images/logo.png" alt="Logo" className="h-12" />
      </Link> 
      <div className="flex items-center gap-4">
        {['Inspections', 'Applications','Tickets', 'Properties'].map((label) => (
          label === 'Properties' ? (
            <Link
              key={label}
              to="/BasicLeases"
              className="bg-[#9747FF] text-white px-4 py-1.5 rounded-full font-base hover:bg-violet-900 transition"
            >
              {label}
            </Link>
          ) : (
            <button
              key={label}
              className="bg-[#9747FF] text-white px-4 py-1.5 rounded-full font-base hover:bg-violet-900 transition"
            >
              {label}
            </button>
          )
        ))}
        <button className="bg-[#9747FF] text-white px-4 py-1.5 rounded-full font-base hover:bg-violet-900 transition">
          Log out
        </button>
        <img src="/images/user-avatar.png" alt="User Avatar" className="w-10 h-10 rounded-full" />
      </div>
    </div>
  );
}

export default Navbar;