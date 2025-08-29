import React, {useState} from 'react';
import {useTracker} from 'meteor/react-meteor-data';
import { Ten_SettingsIdentities } from "/imports/api/database/collections";
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import IdentityModal from '../components/IdentityModal';

function IdentitySettings() {
    const tenID = Meteor.userId();

    const [openModal, setOpenModal] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [editingIdentity, setEditingIdentity] = useState(null);

    const identities = useTracker(() => {
        Meteor.subscribe('tenSettingsIdentities');
        if (!tenID) return [];
        return Ten_SettingsIdentities.find({ ten_id: tenID }).fetch();
    }, [tenID]);

    const handleSaveIdentity = (IdentityData) => {
        if (editingIdentity) {
            // Update existing identity
            Meteor.call('tenantIdentities.update', editingIdentity.identity_id, 
                {
                    identity_type: IdentityData.type,
                    identity_scan: IdentityData.scan || '',
                    identity_desc: IdentityData.description || '',
                    identity_public_id: IdentityData.public_id || '',
                }, (err) => {
                    if (err) {
                        setStatusMessage(`Error updating identity: ${err.message}`);
                    } else {
                        setStatusMessage('Identity updated successfully.');
                    }
                });
            } else {
            // Insert new identity
            const identityDoc = {
                identity_id: Random.id(),
                ten_id: tenID,
                identity_type: IdentityData.type,
                identity_scan: IdentityData.scan || '',
                identity_desc: IdentityData.description || '',
                identity_public_id: IdentityData.public_id || '',
            };

            Meteor.call('tenantIdentities.insert', identityDoc, (err) => {
                if (err) {
                    setStatusMessage(`Error saving identity: ${err.message}`);
                } else {
                    setStatusMessage('Identity added successfully.');
                }
            });
        }

        setOpenModal(false);
        setEditingIdentity(null);
        };

    const handleEditIdentity = (identity) => {
        setEditingIdentity({
            identity_id: identity.identity_id,
            type: identity.identity_type,
            scan: identity.identity_scan,
            description: identity.identity_desc || '',
            public_id: identity.identity_public_id || '',
        });
        setOpenModal(true);
    };

    const handleDeleteIdentity = (identityId) => {
        if (window.confirm('Are you sure you want to delete this identity?')) {
            Meteor.call('tenantIdentities.remove', identityId, (err) => {
                if (err) {
                    setStatusMessage(`Error deleting identity: ${err.message}`);
                } else {
                    setStatusMessage('Identity deleted successfully.');
                }
            });
        }
    };

    const renderMedia = (url) => {
         if (!url) return null;
    const ext = url.split('.').pop().toLowerCase();
    if (['mp4', 'webm', 'mov'].includes(ext)) {
      return <video src={url} controls className="w-full rounded-md border mt-1 max-h-48" />;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return <img src={url} alt="Uploaded" className="w-full rounded-md border mt-1 max-h-48 object-contain" />;
    } else {
      return <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>;
    }
  };

  return (
  <div>
    <h3 className="text-xl font-semibold mb-2"> Identity Documents </h3>

    <button
        onClick={() => { setEditingIdentity(null); setOpenModal(true);}}
        className="bg-[#CBADD8] px-6 py-2 rounded-full font-semibold hover:bg-[#9747FF] hover:text-white transition mb-4"
        >
        Add Identity Document
        </button>

        <div className ="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {identities.map((identity) => (
            <div key={identity.identity_id} className="bg-white p-5 rounded-lg shadow-md relative border hover:shadow-lg">
                <div className="absolute top-3 right-3 flex space-x-2">
              <button
                onClick={() => handleEditIdentity(identity)}
                className="text-blue-600 hover:text-blue-800 text-sm font-semibold underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteIdentity(identity.identity_id)}
                className="text-red-500 hover:text-red-700 font-bold text-lg"
              >
                ×
              </button>
                </div>

                <p className=" font-semibold text-lg truncate">{identity.identity_type}</p>
                {identity.identity_desc && <p className="text-sm text-gray-600 mt-1 italic">"{identity.identity_desc}"</p>}
            {identity.identity_scan && <div className="mt-3">{renderMedia(identity.identity_scan)}</div>}
            </div>
        ))}
  </div>

  {statusMessage && <p className="mt-4 text-green-600">{statusMessage}</p>}

      <IdentityModal
        open={openModal}
        onClose={() => { setOpenModal(false); setEditingIdentity(null); }}
        onSave={handleSaveIdentity}
        initialData={editingIdentity}
      />
    </div>
  );
}

export default IdentitySettings;
