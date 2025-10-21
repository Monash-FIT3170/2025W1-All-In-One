import React, { useState } from "react";
import { Meteor } from "meteor/meteor";

export const BookingConfirmDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  bookingData,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [newTime, setNewTime] = useState("");

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!bookingData) return;
    setIsSending(true);

    try {
      // Confirm booking in database
      await onConfirm();

      // Send confirmation email to both tenant and agent
      Meteor.call("sendBookingEmail", bookingData, (err) => {
        if (err) {
          alert("Booking confirmed, but email failed to send: " + err.reason);
        } else {
          alert("Booking confirmed and emails sent successfully!");
        }
      });
    } catch (error) {
      alert("Booking failed: " + error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleReschedule = () => {
    setShowReschedule(true);
  };

  const handleSubmitReschedule = () => {
    if (!newTime) {
      alert("Please select a new date/time.");
      return;
    }

    Meteor.call(
      "tenantBookings.reschedule",
      bookingData.agentAvailabilityId,
      newTime,
      (err) => {
        if (err) {
          alert("Rescheduling failed: " + err.reason);
        } else {
          alert("Reschedule request sent to the agent!");
          setShowReschedule(false);
          onCancel();
        }
      }
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Confirm Booking
        </h2>

        {!showReschedule ? (
          <>
            <p className="text-gray-600 mb-6">
              Are you sure you want to book this inspection slot?
            </p>
            <div className="flex justify-around">
              <button
                onClick={onCancel}
                className="bg-gray-300 hover:bg-gray-200 text-black font-semibold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                className="bg-yellow-400 hover:bg-yellow-300 text-white font-semibold py-2 px-4 rounded"
              >
                Reschedule
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSending}
                className="bg-[#9747FF] hover:bg-purple-200 text-white font-semibold py-2 px-4 rounded disabled:opacity-60"
              >
                {isSending ? "Sending..." : "Confirm"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-4">
              Enter your preferred new time for inspection:
            </p>
            <input
              type="datetime-local"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 mb-4 focus:ring-2 focus:ring-purple-400"
            />
            <div className="flex justify-around">
              <button
                onClick={() => setShowReschedule(false)}
                className="bg-gray-300 hover:bg-gray-200 text-black font-semibold py-2 px-4 rounded"
              >
                Back
              </button>
              <button
                onClick={handleSubmitReschedule}
                className="bg-[#9747FF] hover:bg-purple-200 text-white font-semibold py-2 px-4 rounded"
              >
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

