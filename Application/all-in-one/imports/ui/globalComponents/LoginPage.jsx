import { Meteor } from "meteor/meteor";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserIcon } from '@heroicons/react/24/solid';

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    setIsLoggingIn(true);

    Meteor.loginWithPassword(email, password, (err) => {
      if (err) {
        alert("Login failed: " + (err.reason || err.message || "Unknown error"));
        setIsLoggingIn(false);
      } else {
        const checkUser = setInterval(() => {
          const user = Meteor.user();
          if (user && user.profile && user.profile.role) {
            clearInterval(checkUser);
            const role = user.profile.role;

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
      {/* Left Side */}
      <div className="w-2/5 bg-[#FFF8E9] flex flex-col items-center justify-center p-10">
        <img src="/images/logo.png" alt="All In One Logo" className="mb-8 w-52" />
        <h2 className="text-2xl font-semibold mb-4">Don’t have an account?</h2>
        <Link
          to="/signup"
          className="bg-[#9747FF] hover:bg-[#5c2b9b] text-[#FFFFFF] text-xl font-bold py-3 px-20 rounded flex items-center gap-2 mb-6 no-underline"
        >
          <UserIcon className="h-5 w-5 text-white" />
          <span>Sign Up</span>
        </Link>
        <p className="text-sm text-gray-600 mb-6">Forgot Password?</p>
        <img src="/images/house.png" alt="All In One House" className="mt-[40px] mb-8 w-80" />
      </div>

      {/* Right Side */}
      <div className="w-3/5 bg-[#CBADD8] flex flex-col items-center justify-center p-10">
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
