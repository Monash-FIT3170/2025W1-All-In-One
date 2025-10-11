import React, { useState, useEffect } from "react";
import { Accounts } from "meteor/accounts-base";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

export const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { token } = useParams(); 

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("Resetting password...");

    Accounts.resetPassword(token, password, (err) => {
      if (err) {
        setMessage("Error: " + (err.reason || err.message));
      } else {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
        {/* Navbar */}
        <NavBar />
    <div className="flex flex-grow items-center justify-center bg-[#FFF8E9]">
      <div className="bg-white p-8 rounded-2xl shadow-md w-[400px] text-center">
        <h1 className="text-2xl font-bold mb-4">Reset Your Password</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="New password"
            className="border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-[#9747FF] hover:bg-[#5c2b9b] text-white font-bold py-2 rounded"
          >
            Reset Password
          </button>
        </form>

        {/* Security Note same as settings*/}
      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-md text-left">
        <h4 className="font-semibold text-purple-800 mb-2">Security Tips:</h4>
        <ul className="list-disc list-outside pl-6 text-sm text-purple-700 space-y-1">
          <li>
            {" "}
            Use a strong password with a mix of letters, numbers, and symbols
          </li>
          <li> Don't reuse passwords from other accounts</li>
          <li> Consider using a password manager</li>
        </ul>
      </div>

        {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
      </div>
    </div>


        {/* Footer */}
        <Footer />
      </div>
  );
};
