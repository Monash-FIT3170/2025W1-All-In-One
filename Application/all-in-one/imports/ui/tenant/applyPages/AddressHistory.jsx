import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Addresses, RentalApplications, Ten_SettingsAddresses } from '/imports/api/database/collections';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import AddressModal from '../components/AddressModal';

function AddressHistory({ propId, tenId }) {
  const [openModal, setOpenModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('Current');
  const [editingAddress, setEditingAddress] = useState(null);
  const [rentalAppId, setRentalAppId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const rentalApp = useTracker(() => {
    Meteor.subscribe('rentalApplications');
    return RentalApplications.findOne({ prop_id: propId, ten_id: tenId });
  }, [propId, tenId]);

  useEffect(() => {
    if (rentalApp) {
      setRentalAppId(rentalApp._id);
    } 
  }, [rentalApp]);

  const addresses = useTracker(() => {
    Meteor.subscribe('addresses');
    return Addresses.find({ rental_app_id: rentalAppId }).fetch();
  }, [rentalAppId]);

  // Subscribe to settings addresses
  const settingsAddresses = useTracker(() => {
    const handle = Meteor.subscribe('tenSettingsAddresses');
    if (!handle.ready()) return [];
    return Ten_SettingsAddresses.find({ ten_id: tenId }).fetch();
  }, [tenId]);

  // Handler to load addresses from profile for a specific status
  const handleLoadFromProfile = (status) => {
    if (!rentalAppId) {
      setStatusMessage('Please complete the general section first.');
      return;
    }

    const profileAddressesForStatus = settingsAddresses.filter(
      (addr) => addr.address_status === status
    );

    if (profileAddressesForStatus.length === 0) {
      setStatusMessage(`No ${status.toLowerCase()} address found in your profile.`);
      return;
    }

    // NEW: For Current, only load the first one
    const addressesToLoad = status === 'Current' ? [profileAddressesForStatus[0]] : profileAddressesForStatus;


    let successCount = 0;
    let errorCount = 0;

    profileAddressesForStatus.forEach((settingsAddress) => {
      const newAddress = {
        address_id: Random.id(),
        rental_app_id: rentalAppId,
        address_address: settingsAddress.address_address || '',
        address_movein: settingsAddress.address_movein || new Date(),
        address_moveout: settingsAddress.address_moveout || new Date(),
        address_ownership: settingsAddress.address_ownership || '',
        address_reference_type: settingsAddress.address_reference_type || '',
        address_reference_name: settingsAddress.address_reference_name || '',
        address_reference_email: settingsAddress.address_reference_email || '',
        address_reference_number: settingsAddress.address_reference_number || '',
        address_status: settingsAddress.address_status || status,
      };

      Meteor.call('addresses.insert', newAddress, (err) => {
        if (err) {
          errorCount++;
          console.error('Error loading address from profile:', err);
        } else {
          successCount++;
        }

        // Show status message after all calls complete
        if (successCount + errorCount === profileAddressesForStatus.length) {
          if (errorCount > 0) {
            setStatusMessage(`Loaded ${successCount} ${status.toLowerCase()} address(es) from profile. ${errorCount} failed.`);
          } else {
            setStatusMessage(`Successfully loaded ${successCount} ${status.toLowerCase()} address(es) from profile!`);
          }
        }
      });
    });
  };


  const handleSaveAddress = (data) => {
    const isEdit = editingAddress !== null;
    const address_id = isEdit ? editingAddress.address_id : Random.id();

    const doc = {
      address_id,
      rental_app_id: rentalAppId,
      address_address: data.address,
      address_movein: new Date(data.moveIn),
      address_moveout: new Date(data.moveOut),
      address_ownership: data.ownership,
      address_reference_type: data.referenceType,
      address_reference_name: data.referenceName,
      address_reference_email: data.referenceEmail,
      address_reference_number: data.referenceNumber,
      address_status: data.status,
    };

    const method = isEdit ? 'addresses.update' : 'addresses.insert';

    Meteor.call(method, doc, (err) => {
      if (err) alert(`Error: ${err.message}`);
    });

    setEditingAddress(null);
  };

  const handleDelete = (addressId) => {
    if (confirm('Delete this address?')) {
      Meteor.call('addresses.remove', addressId, (err) => {
        if (err) alert(err.message);
      });
    }
  };

  const handleEdit = (address) => {
    setEditingAddress({
      address_id: address.address_id,
      address: address.address_address,
      moveIn: formatDateForEdit(address.address_movein),
      moveOut: formatDateForEdit(address.address_moveout),
      ownership: address.address_ownership,
      referenceType: address.address_reference_type,
      referenceName: address.address_reference_name,
      referenceEmail: address.address_reference_email,
      referenceNumber: address.address_reference_number,
    });
    setSelectedStatus(address.address_status);
    setOpenModal(true);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const formatDateForEdit = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Address History</h3>
      <p className="text-gray-600 text-sm mb-6">Please provide 2 years of address history.</p>

      {['Current', 'Past'].map((status) => {
        // Calculate if we should show the Load button for this status
        const existingAddressesForStatus = addresses.filter((a) => a.address_status === status);
        const profileAddressesForStatus = settingsAddresses.filter((a) => a.address_status === status);
        const hasExisting = existingAddressesForStatus.length > 0;
        const hasProfile = profileAddressesForStatus.length > 0;
        const canLoad = hasProfile && rentalAppId && !hasExisting;

        // NEW: For Current, only allow 1 address
        const canAddMore = status === 'Past' || (status === 'Current' && existingAddressesForStatus.length === 0);
        
        return (
        <div key={status} className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-lg font-medium">{status} Address</h4>
        {/* Wrapped buttons in flex container */}
              <div className="flex gap-3 flex-wrap">
                {canAddMore && (
                <button
                  onClick={() => {
                    setSelectedStatus(status);
                    setEditingAddress(null);
                    setOpenModal(true);
                  }}
                  className="bg-[#CBADD8] px-6 py-2 rounded-full font-semibold hover:bg-[#9747FF] hover:text-white transition"
                >
                  Enter Address
                </button>
                )}

          {/* Load from Profile button */}
                {!hasExisting && (
                  <button
                    onClick={() => handleLoadFromProfile(status)}
                    disabled={!canLoad}
                    className={`px-6 py-2 rounded-full font-semibold transition ${
                      canLoad
                        ? 'bg-[#CBADD8] font-semibold hover:bg-[#9747FF] hover:text-white transition'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    title={!rentalAppId ? 'Please complete the general section first' : !hasProfile ? `No ${status.toLowerCase()} address in profile` : `Load ${status.toLowerCase()} address from profile`}
                  >
                    Load from Profile
                  </button>
                )}
              </div>
            </div>

            {/* Disclaimer text */}
            {canLoad && (
              <p className="text-xs text-gray-500 mb-2 italic">
                You can edit the details in this application once loaded from profile
              </p>
            )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses
              .filter((a) => a.address_status === status)
              .map((a) => (
                <div
                  key={a.address_id}
                  className="bg-white p-5 rounded-lg shadow-md relative border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <button
                      onClick={() => handleEdit(a)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-semibold underline"
                      aria-label="Edit Address"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(a.address_id)}
                      className="text-red-500 hover:text-red-700 font-bold text-lg"
                      aria-label="Delete Address"
                    >
                      ×
                    </button>
                  </div>

                  <p className="font-semibold text-lg mb-2 truncate">{a.address_address}</p>

                  <div className="text-gray-700 text-sm space-y-1">
                    <p>
                      <span className="font-medium">Move In:</span> {formatDate(a.address_movein)}
                    </p>
                    <p>
                      <span className="font-medium">Move Out:</span> {formatDate(a.address_moveout)}
                    </p>
                    <p>
                      <span className="font-medium">Ownership:</span> {a.address_ownership}
                    </p>
                    <p>
                      <span className="font-medium">Reference:</span> {a.address_reference_name} ({a.address_reference_type})
                    </p>
                  </div>
                </div>
                          ))}
                      </div>
                    </div>
        );
})}

    {/* Status message */}
      {statusMessage && <p className="mt-4 text-green-600 text-sm">{statusMessage}</p>}

      <AddressModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditingAddress(null);
        }}
        onSave={handleSaveAddress}
        initialData={editingAddress}
        status={selectedStatus}
      />
    </div>
  );
}

export default AddressHistory;

