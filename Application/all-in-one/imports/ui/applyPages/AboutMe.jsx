import React from 'react';

function AboutMe() {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">About Me</h3>
      <p className="text-gray-600 text-sm mb-6">Tell us about yourself and share with the landlord and agents why you are the best fit for this property.</p>

      {/* About Me */}
      <div className="mb-4">
        <textarea
          type="text"
          id="about-me"
          className="w-full p-2 h-24 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
          placeholder="Tell us a bit about yourself. "
        />
        <p className="text-gray-600 text-sm mb-6">You can @mention other users and organizations.</p>
      </div>

        

      <button className="bg-yellow-300 px-6 py-2 rounded-full font-semibold hover:bg-yellow-400 transition">
        Save Details
      </button>
    </div>
  );
}

export default AboutMe;
