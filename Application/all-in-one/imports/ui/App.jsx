import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import { LoginPage } from './LoginPage.jsx'; // your login page
import { SignUpPage } from './SignUpPage.jsx'; // your signup page

export const App = () => (
  <Router>
    <div>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={
          <div>
            <h1>Home Page</h1>
            <p>Already have an account? 
              <Link to="/login" style={{ color: "blue", marginLeft: "5px" }}>
                Login here
              </Link>
            </p>
            <p>Don't have an account? 
              <Link to="/signup" style={{ color: "blue", marginLeft: "5px" }}>
                Sign up here
              </Link>
            </p>
          </div>
        } />

        {/* Login Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Sign Up Page */}
        <Route path="/signup" element={<SignUpPage />} />

      </Routes>
    </div>
  </Router>
);
