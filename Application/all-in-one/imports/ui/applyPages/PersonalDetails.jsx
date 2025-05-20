import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Tenants, RentalApplications } from '/imports/api/database/collections';

const PersonalDetails = ({ propId = 'P002', tenId = 'T001' }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [rentalAppId, setRentalAppId] = useState(null);

  // Subscribe and fetch tenant and rental application
  const tenant = useTracker(() => {
    Meteor.subscribe('tenants');
    return Tenants.findOne({ ten_id: tenId });
  }, [tenId]);

  const rentalApp = useTracker(() => {
    Meteor.subscribe('rentalApplications');
    return RentalApplications.findOne({ prop_id: propId, ten_id: tenId });
  }, [propId, tenId]);

  // Prefill form when data is ready
  useEffect(() => {
    if (tenant) {
      setFirstName((prev) => prev || tenant.ten_fn || '');
      setLastName((prev) => prev || tenant.ten_ln || '');
      setPhone((prev) => prev || tenant.ten_pn || '');

      // Prefill DOB from tenant.ten_dob if exists, else rentalApp.dob fallback
      setDob(
        (prev) =>
          prev ||
          (tenant.ten_dob
            ? new Date(tenant.ten_dob).toISOString().substr(0, 10)
            : rentalApp && rentalApp.dob
            ? new Date(rentalApp.dob).toISOString().substr(0, 10)
            : '')
      );
    } else if (rentalApp) {
      // fallback if tenant not loaded yet but rentalApp exists
      setDob((prev) => prev || (rentalApp.dob ? new Date(rentalApp.dob).toISOString().substr(0, 10) : ''));
    }

    if (rentalApp) {
      setRentalAppId(rentalApp._id);
    }
  }, [tenant, rentalApp]);

  const handleSave = (e) => {
    e.preventDefault();

    const tenantUpdateData = {
      ten_fn: firstName,
      ten_ln: lastName,
      ten_pn: phone,
      ten_dob: dob ? new Date(dob) : null,
    };

    Meteor.call('tenants.update', tenId, tenantUpdateData, (err) => {
      if (err) {
        setStatusMessage(`Error updating tenant: ${err.message}`);
      } else {
        setStatusMessage('Tenant details saved successfully!');
      }
    });

    // If you want to keep rentalApp DOB in sync, you can add an update here
    // But usually DOB belongs to tenant, so skipping rentalApp update here
  };

  return (
    <form onSubmit={handleSave}>
      <h3 className="text-xl font-semibold mb-2">Personal Details</h3>
      <p className="text-gray-600 text-sm mb-6">Please fill out this section with your details.</p>

      {/* First Name */}
      <div className="mb-4">
        <label htmlFor="first-name" className="block mb-1 font-medium">First Name</label>
        <input
          type="text"
          id="first-name"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="John"
          required
        />
        <p className="text-gray-600 text-sm mb-6">
          Your first name must match the first name stated in your primary identity document.
        </p>
      </div>

      {/* Last Name */}
      <div className="mb-4">
        <label htmlFor="last-name" className="block mb-1 font-medium">Last Name</label>
        <input
          type="text"
          id="last-name"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Doe"
          required
        />
        <p className="text-gray-600 text-sm mb-6">
          Your last name must match the last name stated in your primary identity document.
        </p>
      </div>

      {/* DOB */}
      <div className="mb-4">
        <label htmlFor="DOB" className="block mb-1 font-medium">Date of Birth</label>
        <input
          type="date"
          id="DOB"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          placeholder="DD/MM/YYYY"
        />
        <p className="text-gray-600 text-sm mb-6">*Optional</p>
      </div>

      {/* Phone Number */}
      <div className="mb-4">
        <label htmlFor="phone-number" className="block mb-1 font-medium">Phone Number</label>
        <input
          type="text"
          id="phone-number"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Numbers only; no spaces or special chars."
          pattern="\d*"
          title="Please enter numbers only"
          required
        />
        <p className="text-gray-600 text-sm mb-6">
          Numbers only; without any spaces nor special characters.
        </p>
      </div>

      <button
        type="submit"
        className="bg-yellow-300 px-6 py-2 rounded-full font-semibold hover:bg-yellow-400 transition"
      >
        Save Details
      </button>

      {statusMessage && (
        <p className="mt-4 text-sm text-green-600">{statusMessage}</p>
      )}
    </form>
  );
};

export default PersonalDetails;
