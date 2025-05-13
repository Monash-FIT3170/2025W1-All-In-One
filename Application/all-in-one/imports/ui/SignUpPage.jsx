import { Meteor } from "meteor/meteor";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Tenants } from "imports/api/tenants";
import { Accounts } from 'meteor/accounts-base';
import '/imports/api/collections.tenants';


export const SignUpPage = () => {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    Accounts.createUser({
      username: email,
      email: email,
      password: password,
      profile: { firstName, lastName}
    }, (error) => {
      if (error) {
        alert(error.reason);
      } else {
        // User created successfully, navigate to the dashboard or another page
        const userId = Meteor.userId();
        Tenants.insert({
          ten_id: userId,
          ten_fn: firstName,
          ten_ln: lastName,
          ten_email: email,
          ten_password: "", // never store plain passwords
          ten_pfp: "",
          ten_add: "",
          ten_pn: "",
          ten_role: "tenant",
        });
        navigate("/")

      }
    });
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
        <form className="w-3/4 flex flex-col gap-4" onSubmit={submit}>
          <input
            type="text"
            placeholder="First Name"
            className="border p-2 rounded"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}

          />
          <input
            type="text"
            placeholder="Last Name"
            className="border p-2 rounded"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)} 
          />
          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}  
          />
          <input
            type="password"
            placeholder="New Password"
            className="border p-2 rounded"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="border p-2 rounded"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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