import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Identities, RentalApplications } from '/imports/api/database/collections';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import IdentityModal from '../components/IdentityModal';

function Identity({ propId, tenId }) {
  const [openModal, setOpenModal] = useState(false);
  const [rentalAppId, setRentalAppId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [editingIdentity, setEditingIdentity] = useState(null);

  // Subscribe to rental application
  const rentalApp = useTracker(() => {
    Meteor.subscribe('rentalApplications');
    return RentalApplications.findOne({ prop_id: propId, ten_id: tenId });
  }, [propId, tenId]);

  useEffect(() => {
    if (rentalApp) {
      setRentalAppId(rentalApp._id);
    }
  }, [rentalApp]);

  // Subscribe to all identities (no param)
  const identities = useTracker(() => {
    Meteor.subscribe('identities'); // subscribe to all identities
    if (!rentalAppId) return [];
    return Identities.find({ rental_app_id: rentalAppId }).fetch();
  }, [rentalAppId]);

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

    setOpenModal(false);
    setEditingIdentity(null);
  };

  const handleDeleteIdentity = (identityId) => {
    if (window.confirm('Are you sure you want to delete this identity document?')) {
      Meteor.call('identities.remove', identityId, (err) => {
        if (err) {
          setStatusMessage(`Error deleting identity document: ${err.message}`);
        } else {
          setStatusMessage('Identity document deleted.');
        }
      });
    }
  };

  const handleEditIdentity = (identity) => {
    setEditingIdentity({
      identity_id: identity.identity_id,
      type: identity.identity_type,
      scan: identity.identity_scan,
    });
    setOpenModal(true);
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Identity Documents</h3>
      <p className="text-gray-600 text-sm mb-6">Please upload supporting identity documents.</p>

      <div className="mb-4">
        <button
          onClick={() => {
            setEditingIdentity(null);
            setOpenModal(true);
          }}
          className="bg-[#CBADD8] px-6 py-2 rounded-full font-semibold hover:bg-[#9747FF] hover:text-white transition"
        >
          Add Document
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {identities.map((identity) => (
          <div
            key={identity.identity_id}
            className="bg-white p-5 rounded-lg shadow-md relative border border-gray-200 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="absolute top-3 right-3 flex space-x-2">
              <button
                onClick={() => handleEditIdentity(identity)}
                className="text-blue-600 hover:text-blue-800 text-sm font-semibold underline"
                title="Edit identity document"
                aria-label="Edit identity document"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteIdentity(identity.identity_id)}
                className="text-red-500 hover:text-red-700 font-bold text-lg"
                title="Delete identity document"
                aria-label="Delete identity document"
              >
                ×
              </button>
            </div>

            <p className="font-semibold text-lg mb-2 truncate">{identity.identity_type}</p>

            {identity.identity_scan && (
              <p className="text-gray-700 text-sm mt-1 truncate">Docs: {identity.identity_scan}</p>
            )}
          </div>

        ))}
      </div>

      {/* Save Details Button (disabled placeholder) */}
      <button
        className="bg-[#9747FF] text-white px-6 py-2 rounded-full font-semibold hover:bg-violet-900 hover:text-white transition"
        disabled
      >
        Save Details
      </button>

      {statusMessage && <p className="mt-4 text-green-600 text-sm">{statusMessage}</p>}

      <IdentityModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditingIdentity(null);
        }}
        onSave={handleAddIdentity}
        initialData={editingIdentity}
      />
    </div>
  );
}

export default Identity;
