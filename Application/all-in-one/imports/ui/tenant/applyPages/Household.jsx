import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { RentalApplications } from '/imports/api/database/collections';

function Household() {
  const propId = 'P002'; // Replace or pass as props/context
  const tenantId = 'T001'; // Replace or pass as props/context

  const [hasPets, setHasPets] = useState(false);
  const [petDescription, setPetDescription] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const rentalApplication = useTracker(() => {
    Meteor.subscribe('rentalApplications');
    return RentalApplications.findOne({ prop_id: propId, ten_id: tenantId });
  }, [propId, tenantId]);

  useEffect(() => {
    if (rentalApplication) {
      setHasPets(rentalApplication.household_pets || false);
      setPetDescription(rentalApplication.pet_description || '');
    }
  }, [rentalApplication]);

  const handleSubmit = () => {
    if (!rentalApplication) {
      setStatusMessage('Rental application not found.');
      return;
    }

    Meteor.call(
      'rentalApplications.update',
      rentalApplication._id,
      {
        household_pets: hasPets,
        pet_description: hasPets ? petDescription.trim() : '',
      },
      (err) => {
        setStatusMessage(err ? `Error: ${err.message}` : 'Household details saved!');
      }
    );
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Household</h3>
      <p className="text-gray-600 text-sm mb-6">
        Do you have any pets? Please specify if yes.
      </p>

      <div className="mb-4">
        <label htmlFor="hasPets" className="block mb-1 font-medium">
          Do you have pets?
        </label>
        <select
          id="hasPets"
          value={hasPets ? 'yes' : 'no'}
          onChange={(e) => setHasPets(e.target.value === 'yes')}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>

      {hasPets && (
        <div className="mb-4">
          <label htmlFor="petDescription" className="block mb-1 font-medium">
            Describe your pets
          </label>
          <input
            type="text"
            id="petDescription"
            value={petDescription}
            onChange={(e) => setPetDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
            placeholder="e.g. 2 small dogs, 1 cat"
          />
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="bg-yellow-300 px-6 py-2 rounded-full font-semibold hover:bg-yellow-400 transition"
      >
        Save Details
      </button>

      {statusMessage && (
        <p className="mt-2 text-sm text-green-600">{statusMessage}</p>
      )}
    </div>
  );
}

export default Household;
