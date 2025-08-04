import React, {useState} from 'react';

export const MaintenanceTicketDialog = ({ isOpen, onSelect, onClose, propertyAddress }) => {
  if (!isOpen) return null;

  const [ticketTitle, setTicketTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueStartDate, setIssueStartDate] = useState('');

  const handleSubmit = () => {
    const newTicket = {
      title: ticketTitle,
      type: 'Maintenance',
      propertyAddress: propertyAddress,
      agent: 'REPLACE_WITH_ACTUAL_AGENT_NAME', // You might want to get this dynamically
      issueDescription: issueDescription,
      issueStartDate: issueStartDate,
      dateLogged: new Date().toDateString()
    };
    onSubmit(newTicket); // Call the onSubmit prop with the new ticket data
    onClose(); // Close the dialog after submission
  };



  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-[#CBADD8] p-6 rounded-[2rem] shadow-lg w-[440px] text-center space-y-6 relative">
        {/* X Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl font-bold text-black hover:text-gray-700"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-black">Add Ticket</h2>

        {/*Title Input*/}
        <div className="text-left mb-4">
          <label className="text-l font-semibold text-black block">Title</label>
          <p className="text-sm font-semibold text-gray-600 mb-1">Max 30 characters</p>
          <input
            type="text"
            maxLength="30"
            required
            value={ticketTitle}
            onChange={(e) => setTicketTitle(e.target.value)}
            placeholder="e.g. Tap is leaking"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5 dark:placeholder-gray-400"
          />
        </div>

        {/*Ticket Type*/}
        <div className="text-left mb-4">
          <label className="text-l font-semibold text-black block mb-1">Ticket Type</label>
          <p className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">Maintenance</p>
        </div>

        {/*Property address*/}
        <div className="text-left mb-4">
          <label className="text-l font-semibold text-black block mb-1">Property</label>
          <p className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">{propertyAddress || 'Address not available'}</p>
        </div>

        {/*Agent*/}
        <div className="text-left mb-4">
          <label className="text-l font-semibold text-black block mb-1">Agent</label>
          <p className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">Replace w/ AGENT</p>
        </div>

        {/*Issue Input*/}
        <div className="text-left mb-4">
          <label className="text-l font-semibold text-black block mb-1">What is the issue?</label>
          <textarea
            maxLength="500"
            required
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            placeholder="e.g. Outdoor tap won't stop leaking"
            rows="5" // This attribute controls the initial height of the textarea
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5 dark:placeholder-gray-400"
          />
        </div>

        {/*Date issue began input*/}
        <div className="text-left mb-4">
          <label className="text-l font-semibold text-black block mb-1">When did the issue begin?</label>
          <input
            type="date"
            required
            placeholder="DD/MM/YYYY"
            value={issueStartDate}
            onChange={(e) => setIssueStartDate(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block ps-10 p-2.5 mb-5 w-lg"
          />
        </div>

        {/*date logged*/}
        <div className="text-left mb-4">
          <label className="text-l font-semibold text-black block mb-1">Date Logged</label>
          <p className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">{new Date().toDateString()
          }</p>
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
