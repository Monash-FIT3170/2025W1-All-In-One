import { Meteor } from "meteor/meteor";
import React, { useState } from "react";

export const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e) => {
    e.preventDefault();

    Meteor.loginWithPassword(username, password);
  };

  return (
    
    <form onSubmit={submit} className="login-form">
      <div>
        <h1 className="text-3xl" >Log In</h1>
      </div>
    <div>
      <label htmlFor="username">Username</label>
  
      <input
        type="text"
        placeholder="Username"
        name="username"
        required
        onChange={(e) => setUsername(e.target.value)}
      />
    </div>
  
    <div>
      <label htmlFor="password">Password</label>
  
      <input
        type="password"
        placeholder="Password"
        name="password"
        required
        onChange={(e) => setPassword(e.target.value)}
      />
    </div>
  
    <div>
      <button type="submit" className="mt-2 bg-blue-500 text-white p-2 rounded animate-pulse">Log In</button>
    </div>
  </form>
  );
};