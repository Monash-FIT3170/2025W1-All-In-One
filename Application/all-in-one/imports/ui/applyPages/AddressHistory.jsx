import React, { useState } from 'react';
import AddressModal from '../components/AddressModal'; // Make sure this points to the right path!

function AddressHistory() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Address History</h3>
      <p className="text-gray-600 text-sm mb-6">Please provide 2 years of address history.</p>

      {/* Current Address */}
      <div className="mb-4">
        <label htmlFor="current-address" className="block mb-1 font-medium">
          Current Address
        </label>
        <p className="text-gray-600 text-sm mb-6">Please provide your current address</p>
        <button
          onClick={() => setOpenModal(true)} // <- OPEN MODAL
          className="bg-yellow-100 px-6 py-2 rounded-full font-semibold hover:bg-yellow-400 transition"
        >
          Enter Address
        </button>
      </div>


    {/* Past Address */}
    <div className="mb-4">
        <label htmlFor="past-address" className="block mb-1 font-medium">
        Past Address
        </label>
        <p className="text-gray-600 text-sm mb-6">Please provide any previous addresses you have resided in</p>
        <button
          onClick={() => setOpenModal(true)} // <- OPEN MODAL
          className="bg-yellow-100 px-6 py-2 rounded-full font-semibold hover:bg-yellow-400 transition"
        >
          Enter Address
        </button>
      </div>


      {/* Save Button */}
      <button className="bg-yellow-300 px-6 py-2 rounded-full font-semibold hover:bg-yellow-400 transition">
        Save Details
      </button>

      {/* Address Modal */}
      <AddressModal open={openModal} onClose={() => setOpenModal(false)} />

    </div>
  );
}

export default AddressHistory;
