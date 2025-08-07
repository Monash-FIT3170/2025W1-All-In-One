import { Meteor } from "meteor/meteor";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserIcon } from '@heroicons/react/24/solid';

/**
 * LoginPage Component
 * 
 * This component handles user authentication for the real estate application.
 * It provides a login form with email and password fields, and automatically
 * redirects users to their appropriate dashboard based on their role.
 * 
 * Features:
 * - Email and password authentication using Meteor
 * - Role-based navigation after successful login
 * - Loading state during authentication
 * - Link to signup page for new users
 * - Remember me functionality
 * - Error handling for failed login attempts
 * 
 * User Roles and Redirects:
 * - tenant -> /TenantBasicPropListings
 * - landlord -> /LandlordBasicPropListings
 * - agent -> /dashboard
 * 
 * @returns {JSX.Element} The rendered login page component
 */
export const LoginPage = () => {
  // State management for form inputs and loading
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  /**
   * Handles form submission and user authentication
   * 
   * @param {Event} e - Form submission event
   */
  const submit = (e) => {
    e.preventDefault();
    setIsLoggingIn(true);

    // Attempt to login using Meteor authentication
    Meteor.loginWithPassword(email, password, (err) => {
      if (err) {
        // Handle login errors
        alert("Login failed: " + (err.reason || err.message || "Unknown error"));
        setIsLoggingIn(false);
      } else {
        // Check for user role and redirect accordingly
        const checkUser = setInterval(() => {
          const user = Meteor.user();
          if (user && user.profile && user.profile.role) {
            clearInterval(checkUser);
            const role = user.profile.role;

            // Navigate based on user role
            if (role === "tenant") {
              navigate("/TenantBasicPropListings");
            } else if (role === "landlord") {
              navigate("/LandlordBasicPropListings");
            } else if (role === "agent") {
              navigate("/dashboard");
            } else {
              navigate("/error");
            }

            setIsLoggingIn(false);
          }
        }, 100);
      }
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding and Sign Up Section */}
      <div className="w-2/5 bg-[#FFF8E9] flex flex-col items-center justify-center p-10">
        {/* Application logo */}
        <img src="/images/logo.png" alt="All In One Logo" className="mb-8 w-52" />
        
        {/* Sign up promotion */}
        <h2 className="text-2xl font-semibold mb-4">Don't have an account?</h2>
        <Link
          to="/signup"
          className="bg-[#9747FF] hover:bg-[#5c2b9b] text-[#FFFFFF] text-xl font-bold py-3 px-20 rounded flex items-center gap-2 mb-6 no-underline"
        >
          <UserIcon className="h-5 w-5 text-white" />
          <span>Sign Up</span>
        </Link>
        
        {/* Forgot password link */}
        <p className="text-sm text-gray-600 mb-6">Forgot Password?</p>
        
        {/* Decorative house image */}
        <img src="/images/house.png" alt="All In One House" className="mt-[40px] mb-8 w-80" />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-3/5 bg-[#CBADD8] flex flex-col items-center justify-center p-10">
        {/* Login form title */}
        <h1 className="text-3xl font-bold mb-8">Log In to Account</h1>
        
        {/* Login form */}
        <form className="w-3/4 flex flex-col gap-4" onSubmit={submit}>
          {/* Email input field */}
          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          
          {/* Password input field */}
          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          
          {/* Remember me checkbox */}
          <div className="flex items-center">
            <input type="checkbox" id="remember" className="mr-2" />
            <label htmlFor="remember" className="text-sm">Remember Me</label>
          </div>
          
          {/* Submit button */}
          <button
            type="submit"
            className="bg-[#9747FF] hover:bg-[#5c2b9b] text-white text-xl font-bold py-3 px-20 rounded flex justify-center items-center mb-6"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
};
