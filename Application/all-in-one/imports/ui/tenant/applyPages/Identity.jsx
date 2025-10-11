import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Identities, RentalApplications, Ten_SettingsIdentities } from '/imports/api/database/collections';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import IdentityModal from '../components/IdentityModal';

function Identity({ propId, tenId }) {
  const [openModal, setOpenModal] = useState(false);
  const [rentalAppId, setRentalAppId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [editingIdentity, setEditingIdentity] = useState(null);

  const rentalApp = useTracker(() => {
    Meteor.subscribe('rentalApplications');
    return RentalApplications.findOne({ prop_id: propId, ten_id: tenId });
  }, [propId, tenId]);

  useEffect(() => {
    if (rentalApp) {
      setRentalAppId(rentalApp._id);
    }
  }, [rentalApp]);

  const identities = useTracker(() => {
    Meteor.subscribe('identities');
    if (!rentalAppId) return [];
    return Identities.find({ rental_app_id: rentalAppId }).fetch();
  }, [rentalAppId]);

  // Subscribe to settings identity data
  const settingsIdentities = useTracker(() => {
    const handle = Meteor.subscribe('tenSettingsIdentities');
    if (!handle.ready()) return [];
    return Ten_SettingsIdentities.find({ ten_id: tenId }).fetch();
  }, [tenId]);

  // Handler to load identities from profile
  const handleLoadFromProfile = () => {
    if (!rentalAppId) {
      setStatusMessage('Please complete the general section first.');
      return;
    }

    if (settingsIdentities.length === 0) {
      setStatusMessage('No identity documents found in your profile.');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    settingsIdentities.forEach((settingsIdentity) => {
      const newIdentity = {
        identity_id: Random.id(),
        rental_app_id: rentalAppId,
        identity_type: settingsIdentity.identity_type || '',
        identity_scan: settingsIdentity.identity_scan || '',
        identity_desc: settingsIdentity.identity_desc || '',
        identity_public_id: settingsIdentity.identity_public_id || '',
      };

      Meteor.call('identities.insert', newIdentity, (err) => {
        if (err) {
          errorCount++;
          console.error('Error loading identity from profile:', err);
        } else {
          successCount++;
        }

        // Show status message after all calls complete
        if (successCount + errorCount === settingsIdentities.length) {
          if (errorCount > 0) {
            setStatusMessage(`Loaded ${successCount} document(s) from profile. ${errorCount} failed.`);
          } else {
            setStatusMessage(`Successfully loaded ${successCount} identity document(s) from profile! You can now edit them here.`);
          }
        }
      });
    });
  };


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
      identity_desc: newIdentity.description || '',
      identity_public_id: newIdentity.public_id || '',
    };

    Meteor.call('identities.insert', identityDoc, (err) => {
      if (err) {
        setStatusMessage(`Error saving identity document: ${err.message}`);
      } else {
        setStatusMessage(editingIdentity
          ? 'Identity document updated successfully.'
          : 'Identity document added successfully.');

        // If editing, delete the old identity
        if (editingIdentity?.identity_id) {
          Meteor.call('identities.remove', editingIdentity.identity_id, (removeErr) => {
            if (removeErr) {
              console.warn('Failed to remove old identity during edit:', removeErr.message);
            }
          });
        }
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
      description: identity.description || '',
    });
    setOpenModal(true);
  };

  const renderMedia = (url) => {
    if (!url) return null;
    const extension = url.split('.').pop().toLowerCase();

    if (['mp4', 'webm', 'mov'].includes(extension)) {
      return (
        <div>
          <span className="text-xs text-purple-500">[Video]</span>
          <video
            className="w-full rounded-md border border-gray-300 mt-1"
            controls
            preload="metadata"
            style={{ maxHeight: '200px' }}
          >
            <source src={url} type={`video/${extension}`} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return (
        <div>
          <span className="text-xs text-green-600">[Image]</span>
          <img
            src={url}
            alt="Uploaded Identity"
            className="w-full rounded-md border border-gray-300 mt-1 max-h-48 object-contain"
          />
        </div>
      );
    } else {
      return (
        <div>
          <span className="text-xs text-yellow-600">[Link]</span>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            View Document
          </a>
        </div>
      );
    }
  };

  // Check if profile identities are available and can be loaded
  const hasProfileIdentities = settingsIdentities.length > 0;
  const hasExistingIdentities = identities.length > 0;
  const canLoadFromProfile = hasProfileIdentities && rentalAppId && !hasExistingIdentities;


  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Identity Documents</h3>
      <p className="text-gray-600 text-sm mb-6">Please upload supporting identity documents (image/video/file link).</p>

      <div className="mb-4">
        {/* Added flex container with gap for both buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => {
              setEditingIdentity(null);
              setOpenModal(true);
            }}
            className="bg-[#CBADD8] px-6 py-2 rounded-full font-semibold hover:bg-[#9747FF] hover:text-white transition"
          >
            Add Document
          </button>

          {/* Load from Profile button - only show if no existing identities */}
          {!hasExistingIdentities && (
            <button
              onClick={handleLoadFromProfile}
              disabled={!canLoadFromProfile}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                canLoadFromProfile
                  ? 'bg-[#CBADD8] hover:bg-[#9747FF] hover:text-white transition'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={!rentalAppId ? 'Please complete the general section first' : !hasProfileIdentities ? 'No identity documents in profile' : 'Load identity documents from your profile'}
            >
              Load from Profile
            </button>
          )}
        </div>
        {/* Disclaimer text */}
        {canLoadFromProfile && (
          <p className="text-xs text-gray-500 mt-2 italic">
            You can edit the details in this application once loaded from profile
          </p>
        )}
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

            <p className="font-semibold text-lg truncate">{identity.identity_type}</p>

            {identity.description && (
              <p className="text-sm text-gray-600 mt-1 italic">"{identity.description}"</p>
            )}

            {identity.identity_scan && (
              <div className="mt-3">{renderMedia(identity.identity_scan)}</div>
            )}
          </div>
        ))}
      </div>

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

