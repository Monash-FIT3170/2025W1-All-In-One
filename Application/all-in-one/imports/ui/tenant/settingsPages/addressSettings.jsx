import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Ten_SettingsAddresses } from "/imports/api/database/collections";
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import AddressModal from '../components/AddressModal';

function SettingsAddresses () {
    const tenID= Meteor.userId();
    const [openModal, setOpenModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('Current');
    const [editingAddress, setEditingAddress] = useState(null);

    const addresses= useTracker (() => {
        Meteor.subscribe('tenSettingsAddresses');
        if (!tenID) return [];
        return Ten_SettingsAddresses.find ({ ten_id: tenID }).fetch();
    }, [tenID]);

    const handleSaveAddress = (data) => {
        const isEdit = !!editingAddress;
        const address_id= isEdit? editingAddress.address_id : Random.id();

        const doc = {
            //ten_id: tenID,
            address_address: data.address,
            address_movein: new Date(data.moveIn),
            address_moveout: new Date(data.moveOut),
            address_ownership: data.ownership,
            address_reference_type: data.referenceType,
            address_reference_name: data.referenceName,
            address_reference_email: data.referenceEmail,
            address_reference_number: data.referenceNumber,
            address_status: selectedStatus,
        };

        // Debug log to verify data before sending
  console.log('Sending to server:', {
    ...doc,
    address_movein: doc.address_movein?.toISOString(),
    address_moveout: doc.address_moveout?.toISOString()
  });

        if (isEdit) {
    // Update: pass ID separately, doc sanitized
    Meteor.call('tenantAddresses.update', address_id, doc, (err) => {
      if (err) alert(`Error: ${err.message}`);
    });
  } else {
    // Insert: include address_id + ten_id
    Meteor.call('tenantAddresses.insert', { address_id, ten_id: tenID, ...doc }, (err) => {
      if (err) alert(`Error: ${err.message}`);
    });
  }

        setEditingAddress(null);
        setOpenModal(false);
    };

    const handleEdit= (address) => {
        setEditingAddress ({
            address_id: address.address_id,
            address: address.address_address,
            moveIn: new Date(address.address_movein).toISOString().split('T')[0],
            moveOut: new Date(address.address_moveout).toISOString().split('T')[0],
            ownership: address.address_ownership,
            referenceType: address.address_reference_type,
            referenceName: address.address_reference_name,
            referenceEmail: address.address_reference_email,
            referenceNumber: address.address_reference_number,
        });
        setSelectedStatus(address.address_status);
        setOpenModal(true);
    };

    const handleDelete = (addressId) => {
        if (confirm('Delete this address?')) {
      Meteor.call('tenantAddresses.remove', addressId, (err) => {
        if (err) alert(err.message);
      });
    }
    };

    const formatDate = (date) => {
    const d = new Date(date);
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

      return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Address History</h3>
      <p className="text-gray-600 text-sm mb-6">Please provide 2 years of address history.</p>

      {['Current', 'Past'].map((status) => (
        <div key={status} className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-lg font-medium">{status} Address</h4>
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
          </div>

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
      ))}

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

export default SettingsAddresses;