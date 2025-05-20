import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Incomes, RentalApplications } from '/imports/api/database/collections';
import IncomeModal from '../components/IncomeModal';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

function Income({ propId = 'P002', tenId = 'T001' }) {
  const [openModal, setOpenModal] = useState(false);
  const [incomeSources, setIncomeSources] = useState([]);
  const [rentalAppId, setRentalAppId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Subscribe to rental application
  const rentalApp = useTracker(() => {
    Meteor.subscribe('rentalApplications');
    return RentalApplications.findOne({ prop_id: propId, ten_id: tenId });
  }, [propId, tenId]);

  // Once rental application is available, store its ID (or hardcode for testing)
  useEffect(() => {
    if (rentalApp) {
      setRentalAppId(rentalApp._id);
    } else {
      // Hardcoded fallback for testing
      setRentalAppId('RA001');
    }
  }, [rentalApp]);

  // Subscribe and load income sources from DB
  const incomes = useTracker(() => {
    if (!rentalAppId) return [];
    Meteor.subscribe('incomes');
    return Incomes.find({ rental_app_id: rentalAppId }).fetch();
  }, [rentalAppId]);

  // Load DB incomes into local state
  useEffect(() => {
    if (incomes && incomes.length) {
      setIncomeSources(incomes.map(i => ({
        id: i.inc_id,
        type: i.inc_type,
        amount: i.inc_amt,
        documents: i.inc_supporting_doc,
      })));
    } else {
      setIncomeSources([]); // reset if empty
    }
  }, [incomes]);

  // Handle saving new income to DB
  const handleAddIncome = (newIncome) => {
    if (!rentalAppId) {
      setStatusMessage('Please complete the general section first.');
      return;
    }

    const incomeDoc = {
      inc_id: Random.id(),
      rental_app_id: rentalAppId,
      inc_type: newIncome.type,
      inc_amt: parseFloat(newIncome.amount),
      inc_supporting_doc: newIncome.documents || '',
    };

    Meteor.call('incomes.insert', incomeDoc, (err) => {
      if (err) {
        setStatusMessage(`Error adding income: ${err.message}`);
      } else {
        setStatusMessage('Income source added successfully.');
      }
    });
  };

  // Handle deleting income
  const handleDeleteIncome = (incId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this income source?');
    if (!confirmDelete) return;

    Meteor.call('incomes.remove', incId, (err) => {
      if (err) {
        setStatusMessage(`Error deleting income: ${err.message}`);
      } else {
        setStatusMessage('Income source deleted.');
        setIncomeSources(prev => prev.filter(i => i.id !== incId));
      }
    });
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Income</h3>
      <p className="text-gray-600 text-sm mb-6">
        Please provide supporting documents to help show that you can afford the rent.
      </p>

      {/* Add Source Button */}
      <div className="mb-4">
        <label htmlFor="income" className="block mb-1 font-medium">
          Income
        </label>
        <button
          onClick={() => setOpenModal(true)}
          className="bg-yellow-100 px-6 py-2 rounded-full font-semibold hover:bg-yellow-400 transition"
        >
          Add Source
        </button>
      </div>

      {/* Display Saved Income Sources */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {incomeSources.map((source, index) => (
          <div key={index} className="bg-white border rounded-lg p-4 shadow-sm relative">
            <button
              onClick={() => handleDeleteIncome(source.id)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl"
              title="Delete income source"
            >
              ×
            </button>
            <p className="font-semibold">{source.type}</p>
            <p className="text-sm text-gray-600">Amount: ${source.amount}</p>
            {source.documents && (
              <p className="text-sm text-gray-500 mt-1">Docs: {source.documents}</p>
            )}
          </div>
        ))}
      </div>

      {/* Save Button */}
      <button
        className="bg-yellow-300 px-6 py-2 rounded-full font-semibold hover:bg-yellow-400 transition"
        disabled
      >
        Save Details
      </button>

      {/* Feedback */}
      {statusMessage && <p className="mt-4 text-green-600 text-sm">{statusMessage}</p>}

      {/* Modal */}
      <IncomeModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={handleAddIncome}
      />
    </div>
  );
}

export default Income;
