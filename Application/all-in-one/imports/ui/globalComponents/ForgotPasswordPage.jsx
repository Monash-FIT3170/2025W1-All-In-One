import React, { useState } from "react";
import { Accounts } from "meteor/accounts-base";
import NavBar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSending) return; // prevent double clicks
    setIsSending(true);
    setMessage("Sending reset email...");

    Accounts.forgotPassword({ email }, (err) => {
  if (err) console.error("Forgot password error:", err);
  setMessage(
    <p className="mt-4 text-sm text-gray-700">
  Success!<br />
  If an account exists for this email, a reset link has been sent.<br />
  Please check your inbox (and spam folder), and follow the instructions within.
</p>

  );
  setIsSending(false);
});

  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <NavBar />

      {/* Main content */}
      <div className="flex flex-grow items-center justify-center bg-[#FFF8E9]">
        <div className="bg-white p-8 rounded-2xl shadow-md w-[400px] text-center">
          <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
          <p className="text-gray-600 mb-6">
            Enter your account email and we’ll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="border p-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              className={`bg-[#9747FF] hover:bg-[#5c2b9b] text-white font-bold py-2 rounded ${
                isSending ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isSending}
            >
              {isSending ? "Please wait..." : "Send Reset Email"}
            </button>
          </form>

          {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};
