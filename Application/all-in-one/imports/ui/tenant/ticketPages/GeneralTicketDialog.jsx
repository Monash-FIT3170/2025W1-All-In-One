import React, { useState } from 'react';

export const GeneralTicketDialog = ({ isOpen, onClose, propertyAddress }) => {
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    //update mongo
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-[#CBADD8] p-6 rounded-[2rem] shadow-lg w-[440px] text-center space-y-6 relative overflow-y-auto max-h-[90vh]">
        {/* X Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl font-bold text-black hover:text-gray-700"
        >
          ×
        </button>

        <h2 className="text-3xl font-bold text-black">Ticket Number: 1</h2>

        {/*Title Input*/}
        <div className="text-left mb-6">
          <label className="text-l font-semibold text-black block">Title</label>
          <p className="text-sm font-semibold text-gray-600 mb-1">Max 30 characters</p>
          <input
            type="text"
            maxLength="30"
            required
            value={ticketTitle}
            placeholder="e.g. Contract renewal"
            onChange={(e) => setTicketTitle(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:placeholder-gray-400"
          />
        </div>

        {/*Ticket Type*/}
        <div className="text-left mb-6">
          <label className="text-l font-semibold text-black block mb-2">Ticket Type</label>
          <p className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">
            General
          </p>
        </div>

        {/*Property Address*/}
        <div className="text-left mb-6">
          <label className="text-l font-semibold text-black block mb-2">Property Address</label>
          <p className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">
            {propertyAddress || 'Address not available'}
          </p>
        </div>

        {/*Agent*/}
        <div className="text-left mb-4">
          <label className="text-l font-semibold text-black block mb-1">Agent</label>
          <p className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">Replace w/ AGENT</p>
        </div>

        {/*Description Input*/}
        <div className="text-left mb-6">
          <label className="text-l font-semibold text-black block">Description</label>
          <p className="text-sm font-semibold text-gray-600 mb-1">Please provide details about your request</p>
          <textarea
            rows="4"
            value={ticketDescription}
            onChange={(e) => setTicketDescription(e.target.value)}
            placeholder="e.g. I would like to extend my contract by 6 months"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:placeholder-gray-400"
          ></textarea>
        </div>

        {/*date logged*/}
        <div className="text-left mb-4">
          <label className="text-l font-semibold text-black block mb-1">Date Logged</label>
          <p className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">replace w/ CURRENT DATE</p>
        </div>

        {/*Submit Button*/}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleSubmit}
            className="bg-[#9747FF] hover:bg-violet-900 text-white font-base py-2 px-8 rounded-md shadow-md transition duration-200"
          >
            Submit Ticket
          </button>
        </div>
      </div>
    </div>
  );
};