import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

function PasswordSettings() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    // Clear status message when user starts typing
    if (statusMessage) {
      setStatusMessage("");
      setMessageType("");
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const { currentPassword, newPassword, confirmPassword } = formData;

    if (!currentPassword.trim()) {
      return "Current password is required";
    }

    if (!newPassword.trim()) {
      return "New password is required";
    }

    // Do we check password length?
    // if (newPassword.length < 6) {
    //     return "New password must be at least 6 characters long";
    // }

    if (newPassword !== confirmPassword) {
      return "New password and confirmation do not match";
    }

    if (currentPassword === newPassword) {
      return "New password must be different from current password";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setStatusMessage(validationError);
      setMessageType("error");
      return;
    }

    setLoading(true);
    setStatusMessage("");
    setMessageType("");

    try {
      // 2. Call Meteor method
      await Meteor.callAsync("tenant.changePassword", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      // Show success message
      setStatusMessage("Password changed successfully!");
      setMessageType("success");

      // **Clear the form**
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      console.error(error);
      const errorMessage = error.reason || "Failed to change password";
      setStatusMessage(errorMessage);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4">Change Password</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password */}
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Current Password
          </label>
          <div className="relative">
            <input
              id="currentPassword"
              type={showPasswords.current ? "text" : "password"}
              value={formData.currentPassword}
              onChange={(e) =>
                handleInputChange("currentPassword", e.target.value)
              }
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9747FF] focus:border-transparent"
              placeholder="Enter your current password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("current")}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.current ? (
                <AiOutlineEye />
              ) : (
                <AiOutlineEyeInvisible />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showPasswords.new ? "text" : "password"}
              value={formData.newPassword}
              onChange={(e) => handleInputChange("newPassword", e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9747FF] focus:border-transparent"
              placeholder="Enter your new password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("new")}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.new ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showPasswords.confirm ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9747FF] focus:border-transparent"
              placeholder="Confirm your new password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("confirm")}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.confirm ? (
                <AiOutlineEye />
              ) : (
                <AiOutlineEyeInvisible />
              )}
            </button>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-3 rounded-md ${
              messageType === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {statusMessage}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 rounded-md font-semibold transition ${
            loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#9747FF] text-white hover:bg-violet-900"
          }`}
        >
          {loading ? "Changing Password..." : "Change Password"}
        </button>
      </form>

      {/* Security Note */}
      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-md">
        <h4 className="font-semibold text-purple-800 mb-2">Security Tips:</h4>
        <ul className="text-sm text-purple-700 space-y-1">
          <li>
            {" "}
            Use a strong password with a mix of letters, numbers, and symbols
          </li>
          <li> Don't reuse passwords from other accounts</li>
          <li> Consider using a password manager</li>
        </ul>
      </div>
    </div>
  );
}

export default PasswordSettings;
