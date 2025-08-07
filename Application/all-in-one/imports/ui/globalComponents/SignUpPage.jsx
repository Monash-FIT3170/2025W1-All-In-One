import { Meteor } from "meteor/meteor";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserIcon } from '@heroicons/react/24/solid';

/**
 * SignUpPage Component
 * 
 * This component handles user registration for the real estate application.
 * It provides a signup form with user details and automatically creates
 * a new user account, then logs them in and redirects to the appropriate dashboard.
 * 
 * Features:
 * - User registration with first name, last name, email, and password
 * - Password confirmation validation
 * - Automatic login after successful registration
 * - Role-based navigation after registration (defaults to tenant)
 * - Loading state during registration process
 * - Error handling for registration failures
 * - Link to login page for existing users
 * 
 * User Roles and Redirects:
 * - tenant -> /TenantBasicPropListings
 * - landlord -> /LandlordBasicPropListings
 * - agent -> /dashboard
 * 
 * @returns {JSX.Element} The rendered signup page component
 */
export const SignUpPage = () => {
  const navigate = useNavigate();

  // State management for form inputs and loading
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  /**
   * Handles form submission and user registration
   * 
   * @param {Event} e - Form submission event
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate password confirmation
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setIsSigningUp(true);

    // Register new user using Meteor method
    Meteor.call(
      "registerUser",
      {
        email,
        password,
        firstName,
        lastName,
        role: "tenant", // Default role - can be extended for other roles
      },
      (err) => {
        if (err) {
          // Handle registration errors
          alert("Registration failed: " + err.reason);
          setIsSigningUp(false);
        } else {
          // Automatically log in the newly created user
          Meteor.loginWithPassword(email, password, (err) => {
            if (err) {
              alert("Login failed: " + err.reason);
              setIsSigningUp(false);
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
                    navigate("/error"); // fallback
                  }

                  setIsSigningUp(false);
                }
              }, 100);
            }
          });
        }
      }
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding and Login Section */}
      <div className="w-2/5 bg-[#FFF8E9] flex flex-col items-center justify-center p-10">
        {/* Application logo */}
        <img src="/images/logo.png" alt="All In One Logo" className=" mb-8 w-52" />
        
        {/* Login promotion */}
        <h2 className="text-2xl font-semibold mb-4">Already have an account?</h2>
        <Link
          to="/login"
          className="bg-[#9747FF] hover:bg-[#5c2b9b] text-[#FFFFFF] text-xl font-bold py-3 px-20 rounded flex items-center gap-2 mb-6 no-underline"
        >
          <UserIcon className="h-5 w-5 text-white"/> 
          <span>Log In</span> 
        </Link>
        
        {/* Forgot password link */}
        <p className="text-sm text-gray-600 mb-6">Forgot Password?</p>
        
        {/* Decorative house image */}
        <img src="/images/house.png" alt="All In One Logo" className="mt-[40px] mb-8 w-80" />
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-3/5 bg-[#CBADD8] flex flex-col items-center justify-center p-10">
        {/* Registration form title */}
        <h1 className="text-3xl font-bold mb-8">Create Account</h1>
        
        {/* Registration form */}
        <form className="w-3/4 flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* First name input field */}
          <input
            type="text"
            placeholder="First Name"
            className="border p-2 rounded"
            required
            onChange={(e) => setFirstName(e.target.value)}
          />
          
          {/* Last name input field */}
          <input
            type="text"
            placeholder="Last Name"
            className="border p-2 rounded"
            required
            onChange={(e) => setLastName(e.target.value)}
          />
          
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
            placeholder="New Password"
            className="border p-2 rounded"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          
          {/* Confirm password input field */}
          <input
            type="password"
            placeholder="Confirm Password"
            className="border p-2 rounded"
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          
          {/* Submit button */}
          <button
            type="submit"
            className="bg-[#9747FF] hover:bg-[#5c2b9b] text-[#FFFFFF] text-xl font-bold py-3 px-20 rounded flex justify-center items-center mb-6"
            disabled={isSigningUp}
          >
            {isSigningUp ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};