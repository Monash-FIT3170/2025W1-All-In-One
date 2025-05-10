import { Meteor } from "meteor/meteor";
import React, { useState } from "react";
import { Link } from "react-router-dom";


export const SignUpPage = () => {

  const submit = (e) => {
  };

  return (
    <div className="flex min-h-screen">

      {/* Left Side */}
      <div className="w-1/2 bg-[#FFF7E6] flex flex-col items-center justify-center p-10">
        <img src="/images/logo.png" alt="All In One Logo" className="mb-8" />
        <h2 className="text-2xl font-semibold mb-4">Already have an account?</h2>
        <Link to="/login" className="bg-[#F3D673] hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded flex items-center gap-2 mb-6 no-underline"> {/* Added no-underline */}
            <span>Log In</span>
        </Link>
        <p className="text-sm text-gray-600 mb-6">Forgot Password?</p>
      </div>

      {/* Right Side */}
      <div className="w-1/2 bg-[#CEF4F1] flex flex-col items-center justify-center p-10">
        <h1 className="text-3xl font-bold mb-8">Create Account</h1>
        <form className="w-3/4 flex flex-col gap-4">
          <input
            type="text"
            placeholder="First Name"
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            className="border p-2 rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="New Password"
            className="border p-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="border p-2 rounded"
            required
          />
          <button
            type="submit"
            className="bg-[#F3D673] hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded"
          >
            Sign Up
          </button>
        </form>
      </div>

    </div>
  );
};