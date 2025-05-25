import React, { useState, useEffect } from 'react';
import SimpleSchema from 'simpl-schema';

const addressSchema = new SimpleSchema({
  address: String,
  moveIn: Date,
  moveOut: Date,
  ownership: {
    type: String,
    allowedValues: ['yes', 'no'],
  },
  referenceType: String,
  referenceName: String,
  referenceEmail: String,
  referenceNumber: String,
});

function AddressModal({ open, onClose, onSave, initialData = {}, status }) {
  const [formData, setFormData] = useState({
    address: '',
    moveIn: '',
    moveOut: '',
    ownership: '',
    referenceType: '',
    referenceName: '',
    referenceEmail: '',
    referenceNumber: '',
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

const handleSave = () => {
  try {
    // Strip out address_id if present (e.g., in edit mode)
    const { address_id, ...formDataWithoutId } = formData;

    const validatedData = {
      ...formDataWithoutId,
      moveIn: new Date(formData.moveIn),
      moveOut: new Date(formData.moveOut),
    };

    addressSchema.validate(validatedData);

    // Restore address_id after validation
    onSave({ ...validatedData, ...(address_id && { address_id }), status });
    onClose();
  } catch (err) {
    alert(err.message);
  }
};


  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-[#CBADD8] p-8 rounded-lg shadow-lg w-[90%] max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black text-xl font-bold focus:outline-none"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-1">Add Address</h2>
        <p className="text-gray-600 mb-6 text-sm">Fill out the fields to add or update an address.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Address */}
          <div>
            <label className="block font-semibold mb-1">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={handleChange('address')}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="Street, Suburb, State, Postcode, Country"
            />
          </div>

          {/* Move In */}
          <div>
            <label className="block font-semibold mb-1">Move In</label>
            <input
              type="date"
              value={formData.moveIn}
              onChange={handleChange('moveIn')}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          {/* Move Out */}
          <div>
            <label className="block font-semibold mb-1">Move Out</label>
            <input
              type="date"
              value={formData.moveOut}
              onChange={handleChange('moveOut')}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          {/* Ownership */}
          <div>
            <label className="block font-semibold mb-1">Ownership</label>
            <div className="flex gap-4 mt-1">
              {['yes', 'no'].map((val) => (
                <button
                  key={val}
                  onClick={() => setFormData((p) => ({ ...p, ownership: val }))}
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    formData.ownership === val ? 'bg-[#9747FF] text-white' : 'bg-[#CBADD8] border border-[#9747FF] border-2'
                  }`}
                >
                  {val.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Reference Name */}
          <div>
            <label className="block font-semibold mb-1">Reference Name</label>
            <input
              type="text"
              value={formData.referenceName}
              onChange={handleChange('referenceName')}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="Full name"
            />
          </div>

          {/* Reference Number */}
          <div>
            <label className="block font-semibold mb-1">Reference Number</label>
            <input
              type="text"
              value={formData.referenceNumber}
              onChange={handleChange('referenceNumber')}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="Phone number"
            />
          </div>

          {/* Reference Email */}
          <div>
            <label className="block font-semibold mb-1">Reference Email</label>
            <input
              type="email"
              value={formData.referenceEmail}
              onChange={handleChange('referenceEmail')}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="Email"
            />
          </div>

          {/* Reference Type */}
          <div>
            <label className="block font-semibold mb-1">Reference Type</label>
            <input
              type="text"
              value={formData.referenceType}
              onChange={handleChange('referenceType')}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="e.g. landlord, agent"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            className="bg-black text-white px-6 py-2 rounded-full text-sm hover:bg-gray-800"
          >
            Save Address
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddressModal;
