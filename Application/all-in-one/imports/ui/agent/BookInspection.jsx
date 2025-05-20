import React, { useState } from 'react';
import { Calendar } from './Calendar.jsx';


export const BookInspection = () => {

  return (
    <div className="bg-[#FFF8E9] min-h-screen pb-20"> 
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-[#CEF4F1]"> 
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-12" />
        </div>
        <div className="flex gap-4">
          {['Dashboard', 'Applications', 'Properties'].map(label => (
            <button key={label} className="bg-[#FFE284] hover:bg-yellow-200 px-4 py-2 rounded-full font-semibold">
              {label}
            </button>
          ))}
          <button className="bg-[#FFE284] hover:bg-yellow-200 px-4 py-2 rounded-full font-semibold">Log out</button>
          <img src="/user-avatar.png" alt="User" className="w-10 h-10 rounded-full" />
        </div>
      </div>
      
      {/* Calendar */}
      <div className="mt-20">
        <Calendar />
      </div>

    </div>
  );
};
