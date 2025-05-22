import { Meteor } from "meteor/meteor";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export const LoginPage = () => {
  const [email, setEmail] = useState(""); // using email, not "username"
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();

    setIsLoggingIn(true); // disable multiple clicks if needed

    Meteor.loginWithPassword(email, password, (err) => {
      if (err) {
        console.error("Login error:", err);

        if (err.error === 403) {
          alert("Incorrect email or password. Please try again.");
        } else {
          alert("Login failed: " + (err.reason || err.message || "Unknown error"));
        }

        setIsLoggingIn(false);
      } else {
        // We wait for the user to be fully loaded before redirecting
        const checkUser = setInterval(() => {
          const user = Meteor.user();
          if (user && user.profile && user.profile.role) {
            clearInterval(checkUser);
            const role = user.profile.role;

            if (role === "tenant") {
              navigate("/TenantBasicPropListings"); //change to respective page 
            } else if (role === "landlord") {
              navigate("/PLACEHOLDER");
            } else if (role === "agent") {
              navigate("/dashboard");
            } else {
              navigate("/dashboard"); // fallback
            }

            setIsLoggingIn(false);
          }
        }, 100);
      }
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side */}
      <div className="w-1/2 bg-[#ffffff] flex flex-col items-center justify-center p-10">
        <img src="/images/logo.png" alt="All In One Logo" className="mb-8" />
        <h2 className="text-2xl font-semibold mb-4">Don't have an account?</h2>
        <Link
          to="/signup"
          className="bg-[#9747FF] hover:bg-[#7E35D4] text-white font-bold py-2 px-6 rounded flex items-center gap-2 mb-6 no-underline"
        >
          <span>Sign Up</span>
        </Link>
        <p className="text-sm text-gray-600 mb-6">Forgot Password?</p>
      </div>

      {/* Right Side */}
      <div className="w-1/2 bg-[#CBADD8] flex flex-col items-center justify-center p-10">
        <h1 className="text-3xl font-bold mb-8">Log In to Account</h1>
        <form className="w-3/4 flex flex-col gap-4" onSubmit={submit}>
          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex items-center">
            <input type="checkbox" id="remember" className="mr-2" />
            <label htmlFor="remember" className="text-sm">Remember Me</label>
          </div>
          <button
            type="submit"
            className="bg-[#9747FF] hover:bg-[#7E35D4] text-white font-bold py-2 px-6 rounded"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
};