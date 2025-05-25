import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Properties, RentalApplications } from '/imports/api/database/collections';

const GeneralSection = ({ propId, tenId }) => {
  console.log("propId received:", propId);

  // Form state
  const [leaseStart, setLeaseStart] = useState('');
  const [leaseTerm, setLeaseTerm] = useState('');
  const [appRent, setAppRent] = useState('');
  const [propertyInspected, setPropertyInspected] = useState(false); // NEW STATE
  const [statusMessage, setStatusMessage] = useState('');
  
  // Track existing rental application for this property and tenant
  const rentalApplication = useTracker(() => {
    Meteor.subscribe('rentalApplications');
    return RentalApplications.findOne({ prop_id: propId, ten_id: tenId });
  }, [propId, tenId]);

  // Track property data
  const property = useTracker(() => {
    Meteor.subscribe('properties');
    return Properties.findOne({ prop_id: propId });
  }, [propId]);

  // Prefill form fields if rentalApplication exists
  useEffect(() => {
    if (rentalApplication) {
      setLeaseStart(
        rentalApplication.lease_start_date 
          ? new Date(rentalApplication.lease_start_date).toISOString().slice(0, 10) 
          : ''
      );
      setLeaseTerm(rentalApplication.lease_term || '');
      setAppRent(rentalApplication.app_rent ? rentalApplication.app_rent.toString() : '');
      setPropertyInspected(!!rentalApplication.rental_app_prop_inspected); // PREFILL checkbox state
    } else if (property && !appRent) {
      // If no application exists, set rent from property price
      setAppRent(property.prop_pricepweek.toString());
      setPropertyInspected(false); // default unchecked
    }
  }, [rentalApplication, property]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      prop_id: propId,
      lease_start_date: new Date(leaseStart),
      lease_term: leaseTerm,
      app_rent: Number(appRent),
      rental_app_prop_inspected: propertyInspected, // use checkbox state here
      ten_id: tenId,
      leaseholder_id: 'L001',      // keep your defaults or logic here
      employment_id: 'E001',
      household_pets: false,
      status: 'Pending',
    };

    if (rentalApplication) {
      // Update existing rental application
      Meteor.call('rentalApplications.update', rentalApplication._id, data, (err) => {
        setStatusMessage(err ? `Error: ${err.message}` : 'Updated successfully!');
      });
    } else {
      // Insert new rental application with new id
      data.rental_app_id = `RA${Date.now()}`;
      Meteor.call('rentalApplications.insert', data, (err) => {
        setStatusMessage(err ? `Error: ${err.message}` : 'Saved successfully!');
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-semibold">Property ID:</label>
        <p className="bg-gray-100 px-3 py-2 rounded">{propId}</p>
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
          placeholder={property ? `$${property.prop_pricepweek}` : 'Loading...'}
        />
      </div>

      {/* New checkbox for rental inspection */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="rental-inspected"
          checked={propertyInspected}
          onChange={(e) => setPropertyInspected(e.target.checked)}
          className="form-checkbox h-5 w-5 text-yellow-400"
        />
        <label htmlFor="rental-inspected" className="font-semibold">
          I have inspected the property
        </label>
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
