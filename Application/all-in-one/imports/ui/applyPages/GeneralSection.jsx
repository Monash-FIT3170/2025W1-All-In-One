import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';

const GeneralSection = () => {
  const [propId, setPropId] = useState('');
  const [leaseStart, setLeaseStart] = useState('');
  const [leaseTerm, setLeaseTerm] = useState('');
  const [appRent, setAppRent] = useState('');
  const [desc, setDesc] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      rental_app_id: `RA${Date.now()}`, // You can generate a more robust ID
      prop_id: propId,
      lease_start_date: new Date(leaseStart),
      lease_term: leaseTerm,
      app_rent: Number(appRent),
      app_desc: desc,
      rental_app_prop_inspected: false,
      ten_id: 'T001', // Placeholder: replace with logged-in user or form input
      leaseholder_id: 'L001', // Placeholder
      employment_id: 'E001', // Placeholder
      household_pets: false,
      status: 'Pending',
    };

    Meteor.call('rentalApplications.insert', data, (err, res) => {
      if (err) {
        setStatusMessage(`Error: ${err.message}`);
      } else {
        setStatusMessage('Saved successfully!');
        // Optionally reset form here
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        {/* should be atoumated juist placeholder for now */}
        <label className="block font-semibold">Property ID:</label>
        <input
          value={propId}
          onChange={(e) => setPropId(e.target.value)}
          className="border px-3 py-2 rounded w-full"
          placeholder="e.g. P001"
        />
      </div>

      <div>
        <label className="block font-semibold">Lease Start Date:</label>
        <input
          type="date"
          value={leaseStart}
          onChange={(e) => setLeaseStart(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
      </div>

      <div>
        <label className="block font-semibold">Lease Term:</label>
        <input
          value={leaseTerm}
          onChange={(e) => setLeaseTerm(e.target.value)}
          className="border px-3 py-2 rounded w-full"
          placeholder="e.g. 6 months"
        />
      </div>

      <div>
        <label className="block font-semibold">Rent Per Week:</label>
        <input
          type="number"
          value={appRent}
          onChange={(e) => setAppRent(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
      </div>

      <div>
        <label className="block font-semibold">Application Description:</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="border px-3 py-2 rounded w-full"
          placeholder="Why are you applying?"
        />
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

export default GeneralSection;
