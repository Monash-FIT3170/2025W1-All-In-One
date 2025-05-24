import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { RentalApplications } from '/imports/api/database/collections';

function Employment({ propId = 'P002', tenId = 'T001' }) {
  const [notEmployed, setNotEmployed] = useState(false);
  const [empType, setEmpType] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [rentalAppId, setRentalAppId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Match this exactly:
  const rentalApp = useTracker(() => {
    Meteor.subscribe('rentalApplications');
    return RentalApplications.findOne({ prop_id: propId, ten_id: tenId });
  }, [propId, tenId]);

  useEffect(() => {
    if (rentalApp) {
      setRentalAppId(rentalApp._id);
    } else {
      setRentalAppId(null);
    }
  }, [rentalApp]);

const handleSubmit = () => {


  if (notEmployed) {
    Meteor.call('rentalApplications.update', rentalAppId, { employment_id: null }, (err) => {
    });
    return;
  }

  const employment_id = `${tenId}-emp-${Date.now()}`;
  const employmentData = {
    employment_id,
    ten_id: tenId,
    emp_type: empType,
    emp_comp: companyName,
    emp_job_title: jobTitle,
    emp_start_date: new Date(startDate),
    emp_verification: 'null',
  };

  Meteor.call('employment.insert', employmentData, (err) => {

    Meteor.call('rentalApplications.update', rentalAppId, { employment_id }, (err2) => {
      setStatusMessage(err ? `Error: ${err.message}` : 'Saved successfully!');
    });
  });
};


  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Current Employment</h3>
      <p className="text-gray-600 text-sm mb-6">
        Your current employment will be taken into account for the application.
      </p>

      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={notEmployed}
            onChange={(e) => setNotEmployed(e.target.checked)}
            className="w-4 h-4 text-yellow-400 bg-gray-100 border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-gray-700">I am currently not employed</span>
        </label>
      </div>

      {!notEmployed && (
        <>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Employment Type</label>
            <select
              value={empType}
              onChange={(e) => setEmpType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="" disabled>Select your employment type</option>
              <option value="Part Time">Part Time</option>
              <option value="Casual">Casual</option>
              <option value="Full Time">Full Time</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="E.g. Google"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Job Title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="E.g. Manager"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </>
      )}

      <button
        onClick={handleSubmit}
        className="bg-yellow-300 px-6 py-2 rounded-full font-semibold hover:bg-yellow-400 transition"
      >
        Save Details
      </button>

      {statusMessage && (
        <p className="mt-4 text-sm text-green-600">{statusMessage}</p>
      )}
    </div>
  );
}

export default Employment;
