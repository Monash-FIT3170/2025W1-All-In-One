import React, { useState } from 'react';
import AddressModal from '../components/AddressModal'; // Make sure this points to the right path!
import IncomeModal from '../components/IncomeModal';

function AddressHistory() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Income</h3>
      <p className="text-gray-600 text-sm mb-6">Please provide supporting documents to help show that you can afford the rent.</p>

      {/* Income */}
      <div className="mb-4">
        <label htmlFor="income" className="block mb-1 font-medium">
          Income
        </label>
        <button
          onClick={() => setOpenModal(true)} // <- OPEN MODAL
          className="bg-yellow-100 px-6 py-2 rounded-full font-semibold hover:bg-yellow-400 transition"
        >
          Add Source
        </button>
      </div>

    
      {/* Save Button */}
      <button className="bg-yellow-300 px-6 py-2 rounded-full font-semibold hover:bg-yellow-400 transition">
        Save Details
      </button>

      {/* Income Modal */}
      <IncomeModal open={openModal} onClose={() => setOpenModal(false)} />

    </div>
  );
}

export default AddressHistory;
