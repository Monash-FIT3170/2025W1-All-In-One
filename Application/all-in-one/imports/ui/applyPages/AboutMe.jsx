import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { RentalApplications } from '/imports/api/database/collections';

const AboutMe = ({ propId = 'P002', tenId = 'T001' }) => {
  const [description, setDescription] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [rentalAppId, setRentalAppId] = useState(null);

  // Subscribe to rental application for this tenant & property
  const rentalApp = useTracker(() => {
    Meteor.subscribe('rentalApplications');
    return RentalApplications.findOne({ prop_id: propId, ten_id: tenId });
  }, [propId, tenId]);

  // Prefill description from rental application
  useEffect(() => {
    if (rentalApp) {
      setRentalAppId(rentalApp._id);
      setDescription(rentalApp.app_desc || '');
    }
  }, [rentalApp]);

  const handleSave = (e) => {
    e.preventDefault();

    if (!rentalAppId) {
      setStatusMessage('Please save the general section first.');
      return;
    }

    Meteor.call(
      'rentalApplications.update',
      rentalAppId,
      { app_desc: description },
      (err) => {
        if (err) {
          setStatusMessage(`Error saving description: ${err.message}`);
        } else {
          setStatusMessage('Description saved successfully!');
        }
      }
    );
  };

  return (
    <form onSubmit={handleSave}>
      <h3 className="text-xl font-semibold mb-2">About Me</h3>
      <p className="text-gray-600 text-sm mb-6">
        Tell us about yourself and share with the landlord and agents why you
        are the best fit for this property.
      </p>

      {/* About Me Textarea */}
      <div className="mb-4">
        <textarea
          id="about-me"
          className="w-full p-2 h-24 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
          placeholder="Tell us a bit about yourself."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <p className="text-gray-600 text-sm mb-6">
          You can&nbsp;@mention&nbsp;other users and organizations.
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

export default AboutMe;
