import { Meteor } from "meteor/meteor";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const SignUpPage = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setIsSigningUp(true);

    Meteor.call(
      "registerUser",
      {
        email,
        password,
        firstName,
        lastName,
        role: "tenant", // or another role later
      },
      (err) => {
        if (err) {
          alert("Registration failed: " + err.reason);
          setIsSigningUp(false);
        } else {
          Meteor.loginWithPassword(email, password, (err) => {
            if (err) {
              alert("Login failed: " + err.reason);
              setIsSigningUp(false);
            } else {
              const checkUser = setInterval(() => {
                const user = Meteor.user();
                if (user && user.profile && user.profile.role) {
                  clearInterval(checkUser);
                  const role = user.profile.role;

                  if (role === "tenant") {
                    navigate("/PLACEHOLDER"); // CHANGE
                  } else if (role === "landlord") {
                    navigate("/PLACEHOLDER");
                  } else if (role === "agent") { // CHANGE
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
      {/* Left Side */}
      <div className="w-1/2 bg-[#FFF7E6] flex flex-col items-center justify-center p-10">
        <img src="/images/logo.png" alt="All In One Logo" className="mb-8" />
        <h2 className="text-2xl font-semibold mb-4">Already have an account?</h2>
        <Link
          to="/login"
          className="bg-[#F3D673] hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded flex items-center gap-2 mb-6 no-underline"
        >
          <span>Log In</span>
        </Link>
        <p className="text-sm text-gray-600 mb-6">Forgot Password?</p>
      </div>

      {/* Right Side */}
      <div className="w-1/2 bg-[#CEF4F1] flex flex-col items-center justify-center p-10">
        <h1 className="text-3xl font-bold mb-8">Create Account</h1>
        <form className="w-3/4 flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="First Name"
            className="border p-2 rounded"
            required
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last Name"
            className="border p-2 rounded"
            required
            onChange={(e) => setLastName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="New Password"
            className="border p-2 rounded"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="border p-2 rounded"
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="submit"
            className="bg-[#F3D673] hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded"
            disabled={isSigningUp}
          >
            {isSigningUp ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};
