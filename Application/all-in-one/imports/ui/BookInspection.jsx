import React, { useState } from 'react';

export const BookInspection = () => {

  return (
    <div className="bg-[#FFF8E9] min-h-screen pb-20"> 
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-[#CEF4F1]"> 
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-12" />
          <span className="text-xl font-bold">All In One</span>
        </div>
        <div className="flex gap-4">
          {['Messages', 'Applications', 'Tickets', 'Properties'].map(label => (
            <button key={label} className="bg-[#FFE284] px-4 py-2 rounded-full font-semibold">
              {label}
            </button>
          ))}
          <button className="bg-[#FFE284] px-4 py-2 rounded-full font-semibold">Log out</button>
          <img src="/user-avatar.png" alt="User" className="w-10 h-10 rounded-full" />
        </div>
      </div>
      {/* Center Property Box */}
      <div className="flex justify-center mt-20">
        <div className="flex bg-[#D6F2F2] rounded-2xl overflow-hidden shadow-lg w-full max-w-3xl">
          
          {/* Left: Image */}
          <img src="/property.png" alt="Property" className="w-2/3 object-cover" />

          {/* Right: Property Info */}
          <div className="flex flex-col justify-center p-6 bg-[#D6F2F2] w-1/3">
            <p className="text-2xl font-semibold text-gray-600">$700 per week</p>
            <p className="text-gray-600 mt-2">Melton South, 3338</p>
            
            <div className="flex flex-col gap-6 mt-4 text-gray-700 text-lg">
              <div className="flex items-center gap-2">
                <img src="/bed-icon.png" alt="Bed" className="w-6 h-6" />
                <span>3</span>
              </div>
              <div className="flex items-center gap-2">
                <img src="/bath-icon.png" alt="Bath" className="w-6 h-6" />
                <span>7</span>
              </div>
              <div className="flex items-center gap-2">
                <img src="/car-icon.png" alt="Car" className="w-6 h-6" /> 
                <span>4</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
