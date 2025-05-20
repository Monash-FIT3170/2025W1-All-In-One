import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Identities, RentalApplications } from '/imports/api/database/collections';
import IdentityModal from '../components/IdentityModal';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

function Identity({ propId = 'P002', tenId = 'T001' }) {
  const [openModal, setOpenModal] = useState(false);
  const [rentalAppId, setRentalAppId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Subscribe to rental application
  const rentalApp = useTracker(() => {
    Meteor.subscribe('rentalApplications');
    return RentalApplications.findOne({ prop_id: propId, ten_id: tenId });
  }, [propId, tenId]);

  // Store rentalAppId when available
  useEffect(() => {
    if (rentalApp) {
      setRentalAppId(rentalApp._id);
    }
  }, [rentalApp]);

  // Subscribe and load identities for this rental app
  const identities = useTracker(() => {
    if (!rentalAppId) return [];
    Meteor.subscribe('identities');
    return Identities.find({ rental_app_id: rentalAppId }).fetch();
  }, [rentalAppId]);

  // Handle adding new identity doc
  const handleAddIdentity = (newIdentity) => {
    if (!rentalAppId) {
      setStatusMessage('Please complete the general section first.');
      return;
    }

    const identityDoc = {
      identity_id: Random.id(),
      rental_app_id: rentalAppId,
      identity_type: newIdentity.type,
      identity_scan: newIdentity.scan || '',
    };

    Meteor.call('identities.insert', identityDoc, (err) => {
      if (err) {
        setStatusMessage(`Error adding identity document: ${err.message}`);
      } else {
        setStatusMessage('Identity document added successfully.');
      }
    });
  };

  // Handle deleting an identity doc
  const handleDeleteIdentity = (identityId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this identity document?');
    if (!confirmDelete) return;

    Meteor.call('identities.remove', identityId, (err) => {
      if (err) {
        setStatusMessage(`Error deleting identity document: ${err.message}`);
      } else {
        setStatusMessage('Identity document deleted.');
      }
    });
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Identity Documents</h3>
      <p className="text-gray-600 text-sm mb-6">
        Please upload supporting identity documents.
      </p>

      {/* Add Document Button */}
      <div className="mb-4">
        <label htmlFor="identity" className="block mb-1 font-medium">
          Identity
        </label>
        <button
          onClick={() => setOpenModal(true)}
          className="bg-yellow-100 px-6 py-2 rounded-full font-semibold hover:bg-yellow-400 transition"
        >
          Add Document
        </button>
      </div>

      {/* Display Saved Identity Documents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {identities.map((source, index) => (
          <div key={index} className="bg-white border rounded-lg p-4 shadow-sm relative">
            <button
              onClick={() => handleDeleteIdentity(source.identity_id)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl"
              title="Delete identity document"
            >
              ×
            </button>
            <p className="font-semibold">{source.identity_type}</p>
            {source.identity_scan && (
              <p className="text-sm text-gray-500 mt-1">Docs: {source.identity_scan}</p>
            )}
          </div>
        ))}
      </div>

      {/* Save Details Button (disabled placeholder) */}
      <button
        className="bg-yellow-300 px-6 py-2 rounded-full font-semibold hover:bg-yellow-400 transition"
        disabled
      >
        Save Details
      </button>

      {/* Feedback Message */}
      {statusMessage && <p className="mt-4 text-green-600 text-sm">{statusMessage}</p>}

      {/* Modal */}
      <IdentityModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={handleAddIdentity}
      />
    </div>
  );
}

export default Identity;
