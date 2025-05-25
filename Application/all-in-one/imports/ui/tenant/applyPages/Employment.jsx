import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { RentalApplications, Employment } from '/imports/api/database/collections';

function EmploymentSection({ propId = 'P002', tenId = 'T001' }) {
  const [notEmployed, setNotEmployed] = useState(false);
  const [empType, setEmpType] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [rentalAppId, setRentalAppId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const rentalApp = useTracker(() => {
    Meteor.subscribe('rentalApplications');
    return RentalApplications.findOne({ prop_id: propId, ten_id: tenId });
  }, [propId, tenId]);

  const employment = useTracker(() => {
    if (rentalApp?.employment_id) {
      Meteor.subscribe('employment');
      return Employment.findOne({ employment_id: rentalApp.employment_id });
    }
    return null;
  }, [rentalApp]);

  useEffect(() => {
    if (rentalApp) {
      setRentalAppId(rentalApp._id);
    } else {
      setRentalAppId(null);
    }
  }, [rentalApp]);

  // Prefill form with existing employment data
  useEffect(() => {
    if (employment) {
      setEmpType(employment.emp_type || '');
      setCompanyName(employment.emp_comp || '');
      setJobTitle(employment.emp_job_title || '');
      setStartDate(employment.emp_start_date?.toISOString().slice(0, 10) || '');
      setNotEmployed(false);
    } else if (rentalApp && rentalApp.employment_id === null) {
      setNotEmployed(true);
    }
  }, [employment, rentalApp]);

  const handleSubmit = () => {
    if (!rentalAppId) {
      setStatusMessage('Please save the general section first.');
      return;
    }

    if (notEmployed) {
      Meteor.call('rentalApplications.update', rentalAppId, { employment_id: null }, (err) => {
        setStatusMessage(err ? `Error: ${err.message}` : 'Marked as not employed.');
      });
      return;
    }

    const employment_id = rentalApp?.employment_id || `${tenId}-emp-${Date.now()}`;
    const employmentData = {
      employment_id,
      ten_id: tenId,
      emp_type: empType,
      emp_comp: companyName,
      emp_job_title: jobTitle,
      emp_start_date: new Date(startDate),
      emp_verification: 'null',
    };

    Meteor.call('employment.upsert', employmentData, (err) => {
      if (err) {
        setStatusMessage(`Error saving employment: ${err.message}`);
        return;
      }

      Meteor.call('rentalApplications.update', rentalAppId, { employment_id }, (err2) => {
        setStatusMessage(err2 ? `Error: ${err2.message}` : 'Employment saved successfully!');
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

export default EmploymentSection;
