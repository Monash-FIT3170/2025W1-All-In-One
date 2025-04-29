import React from 'react';

function Household() {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Household</h3>
      <p className="text-gray-600 text-sm mb-6">Please provide any additional details</p>

      {/* Household */}
      <div className="mb-4">
      <label htmlFor="household" className="block mb-1 font-medium">
          Pets
        </label>
        <input
          type="input"
          id="household"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
          placeholder="Dogs, Cats, ... "
        />
        <p className="text-gray-600 text-sm mb-6">Please provide the type and number of pets. If there are no pets, leave blank.</p>
      </div>

        

      <button className="bg-yellow-300 px-6 py-2 rounded-full font-semibold hover:bg-yellow-400 transition">
        Save Details
      </button>
    </div>
  );
}

export default Household;
