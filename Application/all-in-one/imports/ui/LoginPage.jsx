import { Meteor } from "meteor/meteor";
import React, { useState } from "react";
import { Link } from "react-router-dom";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e) => {
  };

  return (
    <div className="flex min-h-screen">

      {/* Left Side */}
      <div className="w-1/2 bg-[#FFF7E6] flex flex-col items-center justify-center p-10">
        <img src="/images/logo.png" alt="All In One Logo" className="mb-8" />
        <h2 className="text-2xl font-semibold mb-4">Don't have an account?</h2>
        <Link to="/signup" className="bg-[#F3D673] hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded flex items-center gap-2 mb-6 no-underline"> {/* Added no-underline */}
            <span>Sign Up</span>
        </Link>
        <p className="text-sm text-gray-600 mb-6">Forgot Password?</p>
      </div>

      {/* Right Side */}
      <div className="w-1/2 bg-[#CEF4F1] flex flex-col items-center justify-center p-10">
        <h1 className="text-3xl font-bold mb-8">Log In to Account</h1>
        <form className="w-3/4 flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            className="border p-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded"
            required
          />
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="mr-2"
            />
            <label htmlFor="remember" className="text-sm">Remember Me</label>
          </div>
          <button
            type="submit"
            className="bg-[#F3D673] hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded"
          >
            Log In
          </button>
        </form>
      </div>

    </div>
  );
};