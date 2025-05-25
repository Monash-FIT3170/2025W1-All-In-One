import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Incomes, RentalApplications } from '/imports/api/database/collections';
import IncomeModal from '../components/IncomeModal';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

function Income({ propId, tenId }) {
  const [openModal, setOpenModal] = useState(false);
  const [incomeSources, setIncomeSources] = useState([]);
  const [rentalAppId, setRentalAppId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [editingIncome, setEditingIncome] = useState(null);

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

  // Open modal for adding new income
  const handleAddIncome = () => {
    setEditingIncome(null);
    setOpenModal(true);
  };

  // Open modal for editing income
  const handleEditIncome = (income) => {
    setEditingIncome(income);
    setOpenModal(true);
  };

  // Save (add or update) income
  const handleSaveIncome = (incomeData) => {
    if (!rentalAppId) {
      setStatusMessage('Please complete the general section first.');
      return;
    }

    if (editingIncome) {
      // Update existing income
      const updatedIncome = {
        inc_id: editingIncome.id,
        rental_app_id: rentalAppId,
        inc_type: incomeData.type,
        inc_amt: parseFloat(incomeData.amount),
        inc_supporting_doc: incomeData.documents || '',
      };

      Meteor.call('incomes.update', updatedIncome, (err) => {
        if (err) {
          setStatusMessage(`Error updating income: ${err.message}`);
        } else {
          setStatusMessage('Income source updated successfully.');
          setEditingIncome(null);
        }
      });
    } else {
      // Insert new income
      const newIncome = {
        inc_id: Random.id(),
        rental_app_id: rentalAppId,
        inc_type: incomeData.type,
        inc_amt: parseFloat(incomeData.amount),
        inc_supporting_doc: incomeData.documents || '',
      };

      Meteor.call('incomes.insert', newIncome, (err) => {
        if (err) {
          setStatusMessage(`Error adding income: ${err.message}`);
        } else {
          setStatusMessage('Income source added successfully.');
        }
      });
    }

    setOpenModal(false);
  };

  // Delete income source
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
          onClick={handleAddIncome}
          className="bg-yellow-100 px-6 py-2 rounded-full font-semibold hover:bg-yellow-400 transition"
        >
          Add Source
        </button>
      </div>

      {/* Display Saved Income Sources */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {incomeSources.map((source) => (
          <div
            key={source.id}
            className="bg-white p-5 rounded-lg shadow-md relative border border-gray-200 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="absolute top-3 right-3 flex space-x-2">
              <button
                onClick={() => handleEditIncome(source)}
                className="text-blue-600 hover:text-blue-800 text-sm font-semibold underline"
                aria-label="Edit income source"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteIncome(source.id)}
                className="text-red-500 hover:text-red-700 font-bold text-lg"
                aria-label="Delete income source"
              >
                ×
              </button>
            </div>

            <p className="font-semibold text-lg mb-2 truncate">{source.type}</p>
            <p className="text-gray-700 text-sm">Amount: ${source.amount}</p>
            {source.documents && (
              <p className="text-gray-500 text-sm mt-1 truncate">Docs: {source.documents}</p>
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

      {/* Income Modal */}
      <IncomeModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditingIncome(null);
        }}
        onSave={handleSaveIncome}
        income={editingIncome} // Pass income data for editing
      />
    </div>
  );
}

export default Income;
