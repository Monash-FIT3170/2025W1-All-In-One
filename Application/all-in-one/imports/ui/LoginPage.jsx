import { Meteor } from "meteor/meteor";
import React, { useState } from "react";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e) => {
  };

  return (
    <form onSubmit={submit} className="login-form">

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

      <h1>Hello</h1>

      <div>
      <button type="submit">Log In</button>
      </div>
    </form>
  );
};